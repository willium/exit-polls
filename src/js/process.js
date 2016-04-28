import _ from 'lodash';

export function process(data, filter) {
  let processedData = filterData(data, filter);
  processedData = rollup(processedData);
  processedData = generateGraph(processedData);
  return processedData;
}

function filterData(data, filter) {
  let partial = _.get(data, filter['party']);
  partial = _.get(partial, filter['question']);
  partial = partial['answers'];
  
  partial = _.filter(partial, function(o) {
    const notNull = o['value'] !== 0;
    const stateMatch = _.includes(filter['states'], o['state']);
    const candidateMatch = _.includes(filter['candidates'], o['target_id']);
    const answerMatch = _.includes(filter['answers'], o['source_rank']);
    return notNull && stateMatch && candidateMatch && answerMatch;
  });
  
  return partial;
}

function rollup(data) {
  var output = [];

  _.forEach(data, function(row) {
    var existing = output.filter(function(d){
      return (d.source === row.source) && (d.target === row.target)
    })
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
  var graph = {};
  graph.nodes = [];
  graph.links = [];

  // Add all the data to graph
  data.forEach(function(d) {
    graph.nodes.push({ 'name': d.source, 'meta': d });
    graph.nodes.push({ 'name': d.target, 'meta': d });
    graph.links.push({ 'source': d.source, 'target': d.target, 'value': +d.value, 'meta': d });
  });

  // remove duplicate nodes
  graph.nodes = d3.keys(d3.nest()
    .key(function(d) {return d.name; })
    .map(graph.nodes));

  // Switch links source/target from data to index in the nodes
  graph.links.forEach(function(d, i) {
    graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
    graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
  });

  // now loop through each nodes to make nodes an array of objects
  // rather than an array of strings
  graph.nodes.forEach(function (d, i) {
    graph.nodes[i] = { 'name': d };
  });
  
  return graph;
}