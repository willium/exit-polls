import re
import dataset
import urllib.request, urllib.parse
import json

SOURCE = 'http://data.cnn.com/ELECTION/2016primary/{}/xpoll/{}full.json'

STATES = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']

PARTIES = ['R', 'D']

def buildURL(state, party):
    return SOURCE.format(state, party)

db = dataset.connect('sqlite:///:memory:')
# db = dataset.connect('postgresql://willium@localhost:5432/polls')
index = 0

def percent_to_count(pct, whole):
    try:
        return round(pct*0.01*whole) or 0
    except:
        return 0

for state in STATES:
    for party in PARTIES:
        try:
            URL = buildURL(state, party)
            print('\n\n\n')
            with urllib.request.urlopen(URL) as response:
                raw_bytes = response.read()
                raw_data = raw_bytes.decode(encoding='utf-8',errors='ignore')
                data = json.loads(raw_data)
                index += 1
                print('[{}] Downloaded: {} -- {}'.format(index, state, party))

                questions = data['polls']

                for question in questions:
                    print('Question: {}'.format(question['question']))
                    if question['pollname'].startswith('X'):
                        question['pollname'] = question['pollname'][1:]
                    question['pollname'] = question['pollname'].replace('REP', '').replace('DEM', '')
                    table_name = urllib.parse.quote('{}_{}'.format(question['question'], question['pollname']))
                    print('Table name: {}'.format(table_name))

                    if len(table_name) > 63:
                        break

                    table = db[table_name]

                    default_row = {
                        'party': party,
                        'state': state,
                        'count': 0
                    }

                    candidates = { c['id']: { **{ 'name': '{} {}'.format(c['fname'], c['lname']).strip() }, **default_row } for c in question['candidates'] }

                    total_row = {**default_row, **{
                        'name': 'total',
                        'count': question['numrespondents'] or 0
                    }}

                    for answer in question['answers']:
                        col = answer['answer'].lower().strip().replace('-',' to ').replace('.', '')

                        try:
                            pct = int(answer['pct'])
                        except ValueError as verr:
                            pct = 0

                        total_row[col] = pct or 0
                        total_row['{}:count'.format(col)] = percent_to_count(total_row[col], question['numrespondents'])

                        for candidate_answer in answer['candidateanswers']:
                            try:
                                ca_pct = int(candidate_answer['pct'])
                            except ValueError as verr:
                                ca_pct = 0
                            candidates[candidate_answer['id']][col] = ca_pct or 0
                            ca_count = percent_to_count(candidates[candidate_answer['id']][col], total_row['{}:count'.format(col)])
                            candidates[candidate_answer['id']]['{}:count'.format(col)] = ca_count
                            candidates[candidate_answer['id']]['count'] = candidates[candidate_answer['id']]['count'] + ca_count

                    table.insert_many(candidates.values())
                    table.insert(total_row)

                    result = table.all()
                    fn = 'data/{}.csv'.format(table_name)
                    print('Wrote data for question to: {}'.format(fn))
                    dataset.freeze(result, filename=fn)


        except urllib.error.URLError as e:
            print('{} {} -- {}'.format(e.code, state, party))
