#!/usr/bin/env python
"""This script downloads election exit poll data from CNN and generates a JSON file"""

import json
import urllib.request
import urllib.parse

SOURCE = 'http://data.cnn.com/ELECTION/2016primary/{}/xpoll/{}full.json'

STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN',
          'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV',
          'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
          'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']

PARTIES = ['R', 'D']

def build_url(state, party):
    """generates URL for given state and party"""
    return SOURCE.format(state, party)

def source_poll(state, party):
    """downloads poll for given state and party"""
    try:
        url = build_url(state, party)

        with urllib.request.urlopen(url) as response:
            raw_bytes = response.read()
            raw_data = raw_bytes.decode(encoding='utf-8', errors='ignore')
            json_data = json.loads(raw_data)

        return json_data

    except urllib.error.URLError:
        # e.code
        return None

def save(data, filename='data.json'):
    """saves data to a JSON file"""
    with open(filename, 'w') as outfile:
        json.dump(data, outfile)

    print('wrote JSON to file: {}'.format(filename))

def clean_poll_name(poll_name):
    """clean up poll name"""
    poll_name = poll_name.upper()
    if poll_name.startswith('X'):
        poll_name = poll_name[1:]
    return poll_name.lower().strip()

def create_relationship(source, target, value):
    """generate object describing relationship for export"""
    return {
        'source': source,
        'target': target,
        'value': round(value)
    }

def pct_of(pct, total):
    """calculates pct of, is/of = pct/100"""
    return pct * 0.01 * total

def cast(num):
    """attempts to cast a number to an integer"""
    try:
        return int(num)
    except ValueError:
        return 0

def main():
    """main, parses"""

    meta = {p: {
        'questions': [],
        'candidates': [],
        'states': []
    } for p in PARTIES}

    data = {p: {} for p in PARTIES}
    
    answer_id = 0

    for state in STATES:
        for party in PARTIES:
            result = source_poll(state, party)

            if not result or result is None:
                break

            if state not in meta[party]['states']:
                meta[party]['states'].append(state)

            questions = result['polls']
            for question in questions:
                poll_name = clean_poll_name(question['pollname'])

                if poll_name not in data[party]:
                    data[party][poll_name] = {
                        'question': question['question'],
                        'count': question['numrespondents'],
                        'answers': [],
                        'candidates': []
                    }

                poll = data[party][poll_name]

                if not [pl for pl in meta[party]['questions'] if pl['id'] == poll_name]:
                    meta[party]['questions'].append({
                        'id': poll_name,
                        'question': question['question']
                    })

                candidates = question['candidates']
                for candidate in candidates:
                    candidate_name = '{} {}'.format(candidate['fname'], candidate['lname']).strip()

                    if not [c for c in poll['candidates'] if c['id'] == candidate['id']]:
                        poll['candidates'].append({
                            'id': candidate['id'],
                            'name': candidate_name,
                            'party': candidate['party']
                        })

                    if not [c for c in meta[party]['candidates'] if c['id'] == candidate['id']]:
                        meta[party]['candidates'].append({
                            'id': candidate['id'],
                            'name': candidate_name,
                            'party': candidate['party']
                        })

                answers = question['answers']
                for i, answer in enumerate(answers):
                    answer_pct = cast(answer['pct'])
                    answer_count = pct_of(answer_pct, poll['count'])

                    for cda in answer['candidateanswers']:
                        candidate_answer_pct = cast(cda['pct'])
                        candidate_answer_value = pct_of(candidate_answer_pct, answer_count)

                        match = [c['name'] for c in poll['candidates'] if c['id'] == cda['id']]
                        candidate_name = match[0]

                        poll['answers'].append({
                            **{
                                'state': state,
                                'target_id': cda['id'],
                                'election_date': result['electiondate'],
                                'source_rank': i,
                                'id': answer_id
                            },
                            **create_relationship(
                                source=answer['answer'],
                                target=candidate_name,
                                value=candidate_answer_value
                            )
                        })

                        answer_id += 1

    save(data, 'data.json')
    save(meta, 'meta.json')


if __name__ == "__main__":
    main()
