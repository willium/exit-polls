import json
import urllib.request, urllib.parse

SOURCE = 'http://data.cnn.com/ELECTION/2016primary/{}/xpoll/{}full.json'

STATES = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ]

PARTIES = [ 'R', 'D' ]

def build_url(state, party):
    return SOURCE.format(state, party)

def source_poll(state, party):
    try:
        url = build_url(state, party)

        with urllib.request.urlopen(url) as response:
            raw_bytes = response.read()
            raw_data = raw_bytes.decode(encoding='utf-8',errors='ignore')
            json_data = json.loads(raw_data)

        return json_data

    except urllib.error.URLError as e:
        # e.code
        return None

def save(data, fn='data.min.json'):
    with open(fn, 'w') as outfile:
        json.dump(data, outfile)

def clean_poll_name(pn):
    pn = pn.upper()
    if pn.startswith('X'):
        pn = pn[1:]
    return pn.replace('REP', '').replace('DEM', '').lower().strip()

def create_relationship(source, target, value):
    return {
        'source': source,
        'target': target,
        'value': round(value)
    }

def pct_of(pct, of):
    return pct * 0.01 * of

def cast(num):
    try:
        return int(num)
    except ValueError as verr:
        return 0

def main():
    data = { p: {} for p in PARTIES }

    for state in STATES:
        for party in PARTIES:
            poll = source_poll(state, party)

            if poll and poll is not None:

                questions = poll['polls']
                for question in questions:
                    if clean_poll_name(question['pollname']) not in data[party]:
                        data[party][clean_poll_name(question['pollname'])] = {
                            'question': question['question'],
                            'count': question['numrespondents'],
                            'answers': [],
                            'candidates': {}
                        }

                    q = data[party][clean_poll_name(question['pollname'])]

                    candidates = question['candidates']
                    for candidate in candidates:
                        if candidate['id'] not in q['candidates']:
                            q['candidates'][candidate['id']] = {
                                'name': '{} {}'.format(candidate['fname'], candidate['lname']).strip(),
                                'party': candidate['party']
                            }

                    answers = question['answers']
                    for answer in answers:
                        answer_pct = cast(answer['pct'])
                        answer_count = pct_of(answer_pct, q['count'])

                        for candidate_answer in answer['candidateanswers']:
                            candidate_answer_pct = cast(candidate_answer['pct'])
                            candidate_answer_value = pct_of(candidate_answer_pct, answer_count)
                            candidate_name = q['candidates'][candidate_answer['id']]['name']

                            q['answers'].append({
                                **{ 'state': state, 'candidate_id': candidate_answer['id'] },
                                **create_relationship(source=answer['answer'], target=candidate_name, value=candidate_answer_value)
                            })

    save(data)


if __name__ == "__main__":
    main()
