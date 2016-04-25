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

def save(data, fn='data.json'):
    with open(fn, 'w') as outfile:
        json.dump(data, outfile)

    print('wrote JSON to file: {}'.format(fn))

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
    meta = { 'questions': [], 'candidates': [], 'parties': PARTIES, 'states': [] }
    data = { p: {} for p in PARTIES }

    for state in STATES:
        for party in PARTIES:
            result = source_poll(state, party)

            if result and result is not None:
                if state not in meta['states']:
                    meta['states'].append(state)

                questions = result['polls']
                for question in questions:
                    poll_name = clean_poll_name(question['pollname'])

                    if poll_name not in data[party]:
                        data[party][poll_name] = {
                            'question': question['question'],
                            'count': question['numrespondents'],
                            'answers': [],
                            'candidates': {}
                        }

                    q = data[party][poll_name]

                    if len([pl for pl in meta['questions'] if pl['id'] == poll_name]) is 0:
                        meta['questions'].append({ 'id': poll_name, 'question': question['question'] })

                    candidates = question['candidates']
                    for candidate in candidates:
                        candidate_name = '{} {}'.format(candidate['fname'], candidate['lname']).strip()

                        if candidate['id'] not in q['candidates']:
                            q['candidates'][candidate['id']] = {
                                'name': candidate_name,
                                'party': candidate['party']
                            }

                        if len([cd for cd in meta['candidates'] if cd['id'] == candidate['id']]) is 0:
                            meta['candidates'].append({ 'id': candidate['id'], 'name': candidate_name, 'party': candidate['party'] })

                    answers = question['answers']
                    for i, answer in enumerate(answers):
                        answer_pct = cast(answer['pct'])
                        answer_count = pct_of(answer_pct, q['count'])

                        for candidate_answer in answer['candidateanswers']:
                            candidate_answer_pct = cast(candidate_answer['pct'])
                            candidate_answer_value = pct_of(candidate_answer_pct, answer_count)
                            candidate_name = q['candidates'][candidate_answer['id']]['name']

                            q['answers'].append({
                                **{
                                    'state': state,
                                    'target_id': candidate_answer['id'],
                                    'election_date': result['electiondate'],
                                    'source_rank': i
                                },
                                **create_relationship(
                                    source=answer['answer'],
                                    target=candidate_name,
                                    value=candidate_answer_value
                                )
                            })

    save(data, 'data.json')
    save(meta, 'meta.json')


if __name__ == "__main__":
    main()
