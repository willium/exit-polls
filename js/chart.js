// Global constants
var LOWER_BOUND  = 10, // what is the minimum 'value' for a link to be displayed
    NODE_WIDTH   = 40,
    NODE_PADDING = 40;

// Basic chart constants
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 700 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom;

var color = d3.scale.category20();

// Select and initialize the size of the chart
var svg = d3.select('#canvas')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Create a sanky diagram with these properties
var sankey = d3.sankey()
  .nodeWidth(NODE_WIDTH)
  .nodePadding(NODE_PADDING)
  .size([width, height]);

var path = sankey.link();

var updateChart = function dataUpdate(filter) {
  console.log('update', filter);
}

// Load JSON file, and use it inside the function
d3.json('../source/data.json', function(error, data) {
  if (error) return console.warn(error);

  // testing constants
  // see source/meta.json for all possible values
  var party = 'D';
  var question_id = 'income16';
  var states = [ 'NY', 'AL', 'WY' ];

  var question = data[party][question_id]['question'];
  console.log('Answering the question: ' + question + ' for ' + party + ' in ', states);

  // basic filtering
  answers = data[party][question_id]['answers'].filter(function(d) {
    return states.indexOf(d.state) != -1;
  });

  // roll up data
  answers = rollup(answers);

  // initialize the graph object
  graph  = {'nodes': [], 'links': []};

  // Add all the data to graph
  var zeros = []
  answers.forEach(function(d) {
    if(d.value < LOWER_BOUND) {
      zeros.push({ 'name': d.source })
    } else {
      graph.nodes.push({ 'name': d.source });
      graph.nodes.push({ 'name': d.target });
      graph.links.push({ 'source': d.source, 'target': d.target, 'value': +d.value });
    }
  });

  var nulls = []
  zeros.forEach(function(zr) {
    existing = graph.nodes.filter(function(d){
      return d.name === zr.name
    });
    if (!existing.length && nulls.indexOf(zr.name) == -1) {
      nulls.push(zr.name)
    }
  });

  // remove duplicate nodes
  graph.nodes = d3.keys(d3.nest()
    .key(function(d) {return d.name; })
    .map(graph.nodes));

  console.log('nodes', graph.nodes);
  console.log('nulls', nulls);

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

  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

  // add links to the chart
  var link = svg.append('g').selectAll('.link')
      .data(graph.links)
    .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) {return b.dy - a.dy });

  // Add nodes to the chart
  var node = svg.append('g').selectAll('.node')
      .data(graph.nodes)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d){
        return 'translate(' + d.x + ',' + d.y + ')';
      });

  // Add rectangles to the nodes
  node.append('rect')
      .attr('height', function(d) { return d.dy; })
      .attr('width', sankey.nodeWidth())
      .style('fill', function(d) {return d.color = color(d.name.replace(/ .*/, '')); })
      .style('stroke', function(d) {return d3.rgb(d.color).darker(2); })
    .append('title')
      .text(function(d) {
        return d.name + '\n' + d3.format(',.0f')(d.value);
      });

  // add in the title for the nodes
    node.append('text')
      .attr('x', -6)
      .attr('y', function(d) { return d.dy / 2; })
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('transform', null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr('x', 6 + sankey.nodeWidth())
      .attr('text-anchor', 'start');
});

// rolls up duplicate values for source/target pairs
var rollup = function rollup(data) {
  var output = [];

  data.forEach(function(row) {
    existing = output.filter(function(d){
      return (d.source === row.source) && (d.target === row.target)
    })
    if (existing.length) {
      var index = output.indexOf(existing[0]);
      var currentValue = output[index].value;
      output[index].value = parseInt(currentValue + row.value, 10);
    } else {
      output.push(row);
    }
  });

  return output;
}
