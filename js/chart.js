// Global constants
var LOWER_BOUND  = 10, // what is the minimum 'value' for a link to be displayed
    NODE_WIDTH   = 40,
    NODE_PADDING = 40,
    ITERATIONS   = 32;

// Basic chart constants
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 700 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// set color scale
var color = d3.scale.category20();

// Select and initialize the size of the chart
var svg = d3.select('#canvas').append('svg')
  .attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
  })
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// create groups for links and nodes
var linksGroup = svg.append('g').attr('class', 'links');
var nodesGroup = svg.append('g').attr('class', 'nodes');

// Create a sanky diagram with these properties
var sankey = d3.sankey()
  .nodeWidth(NODE_WIDTH)
  .nodePadding(NODE_PADDING)
  .size([width, height]);

// Get path data generator
var path = sankey.link();

// render the chart, also updates if passed different data
function render(original) {
  // roll up data
  var data = rollup(original);
  // var data = original; // to see all tracks (basically all states data)

  // initialize the graph object
  var graph = {};
  graph.nodes = [];
  graph.links = [];

  // Add all the data to graph
  var nulls = [] // all data points with a value below LOWER_BOUND
  data.forEach(function(d) {
    if(d.value < LOWER_BOUND) {
      nulls.push(d)
    } else {
      graph.nodes.push({ 'name': d.source, 'meta': d });
      graph.nodes.push({ 'name': d.target, 'meta': d });
      graph.links.push({ 'source': d.source, 'target': d.target, 'value': +d.value, 'meta': d });
    }
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

  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(ITERATIONS);
  
  // Draw the links
  var links = linksGroup.selectAll('.link').data(graph.links);
  // Enter
  links.enter()
    .append('path')
    .attr('class', 'link');
  // Enter + Update
  links.attr('d', path)
    .style('stroke-width', function (d) {
      return Math.max(1, d.dy);
    });
  links.append('title')
    .text(function (d) {
      return d.source.name + ' to ' + d.target.name + ' = ' + d.value;
    });
  // Exit
  links.exit().remove();
  
  // Draw the nodes
  var nodes = nodesGroup.selectAll('.node').data(graph.nodes);
  // Enter
  var nodesEnterSelection = nodes.enter()
    .append('g')
    .attr('class', 'node');
  nodesEnterSelection.append('rect')
    .attr('width', sankey.nodeWidth())
    .append('title');
  nodesEnterSelection.append('text')
    .attr('x', sankey.nodeWidth() / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .attr('transform', null);

  // Enter + Update
  nodes
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  nodes.select('rect')
    .attr('height', function (d) {
      return d.dy;
    })
    .style('fill', function (d) {
      return d.color = color(d.name.replace(/ .*/, ''));
    })
    .style('stroke', function (d) {
      return d3.rgb(d.color).darker(2);
    });
  nodes.select('rect').select('title')
    .text(function (d) {
      return d.name;
    });
  nodes.select('text')
    .attr('y', function (d) {
      return d.dy / 2;
    })
    .text(function (d) {
      return d.name;
    });
  // Exit
  nodes.exit().remove();
  
  // return original (pre-rollup to make sure we don't lose data)
  return original;
};

// rolls up duplicate values for source/target pairs
var rollup = function rollup(data) {
  var cloned = _.cloneDeep(data); // slow, but makes sure that 
  var output = [];

  cloned.forEach(function(row) {
    existing = output.filter(function(d){
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
      output.push(row);
    }
  });

  return output;
}
