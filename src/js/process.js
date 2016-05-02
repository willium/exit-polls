import _ from 'lodash';

export function process(data, filter) {
  let processedData = filterData(data, filter);
  processedData = rollup(processedData);
  processedData = generateGraph(processedData);
  return processedData;
}

/* This function takes the raw data and returns the 
 * data for the given party, question after filtering 
 * all the Null values, checking all the states, candidates
 * and answers asked are included.
*/
function filterData(data, filter) {
  let partial = _.get(data, filter['party']);
  partial = _.get(partial, filter['question']);
  partial = partial['answers'];
  
  partial = _.filter(partial, function(d) {
    const notNull = d['value'] !== 0;
    const stateMatch = _.includes(filter['states'], d['state']);
    const candidateMatch = _.includes(filter['candidates'], d['target_id']);
    const answerMatch = _.includes(filter['answers'], d['source_rank']);
    return notNull && stateMatch && candidateMatch && answerMatch;
  });
  return partial;
}

/* This is essentially a aggregator function that returns
 * an array containing deep copy of data with aggregated value
 * and also an array of states voted at
*/
function rollup(data) {
  var output = [];

  _.forEach(data, function(row) {
    var existing = output.filter(function(d){
      return _.isEqual(d.source, row.source) && _.isEqual(d.target, row.target);
    });

    if (existing.length) {
      var index = output.indexOf(existing[0]);
      
      var currentValue = output[index]['value'];
      // add values of duplicate links
      output[index]['value'] = parseInt(currentValue + row['value'], 10);
      
      // keep track of states for reference later
      output[index]['state'] = _.union(output[index]['state'], [row['state']]);
    } else {
      output.push(_.cloneDeep(row));
    }
  });

  return output;
}

function generateGraph(data) {
  // initialize the graph object
  var graph = { 'nodes': [], 'links': [] };
  
  // Add all the data to graph
  data.forEach(function(d) {
    graph.nodes.push({ 'name': d.source, 'type': 'source', 'meta': d });
    graph.nodes.push({ 'name': d.target, 'type': 'target', 'meta': d });
    graph.links.push({ 'source': d.source, 'target': d.target, 'value': +d.value, 'meta': d });
  });
  
  graph.nodes = _.uniqWith(graph.nodes, function(a, b) { return _.isEqual(a.name, b.name); })

  // Switch links source/target from data to index in the nodes
  _.forEach(graph.links, function(d) {
    d.source = _.findIndex(graph.nodes, function(n) { return _.isEqual(n.name, d.source); });
    d.target = _.findIndex(graph.nodes, function(n) { return _.isEqual(n.name, d.target); });
  });
  // return graph
  return graph;
}