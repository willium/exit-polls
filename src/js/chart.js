import d3 from 'd3';
import config from './config';
import UI from './ui';
import { Sankey } from './sankey';

// Basic chart constants
var margin = { top: config.chart.margin.top, right: config.chart.margin.right, bottom: config.chart.margin.bottom, left: config.chart.margin.left },
  width = config.chart.width - margin.left - margin.right,
  height = config.chart.height - margin.top - margin.bottom;

// Select and initialize the size of the chart
var svg = d3.select('#chart').append('svg')
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
var sankey = Sankey()
  .nodeWidth(config.chart.node.width)
  .nodePadding(config.chart.node.padding)
  .size([width, height])
  .levelTop(true) // levelTop and ordinalSort are largely mutually beneficial
  .sort(function ordinal(a, b) {
    return a.meta.source_rank - b.meta.source_rank;
  });

// Get path data generator
var path = sankey.link();

// draw chart
export function draw(graph, options, callback) {
  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(config.chart.iterations);
    
  // Draw the links
  var links = linksGroup.selectAll('.link').data(graph.links, function(d) { return d.meta.id; });
  // Enter
  links.enter()
    .append('path')
    .attr('class', 'link');
  // Enter + Update
  links.attr('d', path)
    .style('stroke-width', function(d) {
      return Math.max(1, d.dy);
    });
  links.append('title')
    .text(function(d) {
      return d.source.name + ' to ' + d.target.name + ' = ' + d.value;
    });
  links.on('mouseover', function(d) {
    d3.select(this).moveToFront();
  });
  // Exit
  links.exit().remove();

  // Draw the nodes
  var nodes = nodesGroup.selectAll('.node').data(graph.nodes, function(d) { return d.meta.target_id + '.' + d.meta.source_rank + '.' + d.value; });
  // Enter
  var nodesEnterSelection = nodes.enter()
    .append('g')
    .attr('class', function(d) {
      return 'node ' + d.type + ' ' + d.meta.party.toLowerCase();
    })
    .attr('id', function(d) { return 'node' + d.meta.id; })
  nodesEnterSelection.append('rect')
    .attr('width', sankey.nodeWidth())
    .append('title');
  nodesEnterSelection.append('text')
    .attr('x', function(d) {
      return _.isEqual(d.type, 'source') ? -config.chart.node.margin : (sankey.nodeWidth() + config.chart.node.margin);
    })
    .attr('dy', '.35em')
    .attr('text-anchor', function(d) {
      return _.isEqual(d.type, 'source') ? 'end' : 'start';
    })
    .attr('transform', null);
  nodesEnterSelection.on("contextmenu", function(d, i) {
    d3.event.preventDefault();
    callback(d3.select('.node.' + d.type + '#node' + d.meta.id), d.type, options);
  }).on("click", function(d, i) {
    d3.event.preventDefault();
    callback(d3.selectAll('.node.' + d.type + ':not(#node' + d.meta.id + ')'), d.type, options);
  });
  nodesEnterSelection.on('mouseover', function(d) {
  d3.selectAll('.link')
    .filter(function (o) {
      return (_.isEqual(d.type, 'source') && _.isEqual(o.meta.source_rank, d.meta.source_rank)) ||
        (_.isEqual(d.type, 'target') && _.isEqual(o.meta.target_id, d.meta.target_id));
    }).classed('selected', true);
  }).on('mouseout', function(d) {
    d3.selectAll('.selected').classed('selected', false);
  });
  // Enter + Update
  nodes
    .attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  nodes.select('rect')
    .attr('height', function(d) {
      return d.dy;
    })
  nodes.select('rect').select('title')
    .text(function(d) {
      return d.name;
    });
  nodes.select('text')
    .attr('y', function(d) {
      return d.dy / 2;
    })
    .text(function(d) {
      return d.name;
    })
    
  // Exit
  nodes.exit().remove();
  
  return shelf;
};