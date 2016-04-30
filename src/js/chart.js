import d3 from 'd3';
import config from './config';
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
  .size([width, height]);

// Get path data generator
var path = sankey.link();

// draw chart
export function draw(graph, rawData) {
  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(config.chart.iterations);
    
  // Draw the links
  var links = linksGroup.selectAll('.link').data(graph.links, function(o) { return o.meta.id; });
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
  links.on('mouseover', function(d) {
    d3.select(this).moveToFront();
  });
  // Exit
  links.exit().remove();

  // Draw the nodes
  var nodes = nodesGroup.selectAll('.node').data(graph.nodes, function(o) { return o.meta.target_id + '.' + o.meta.source_rank + '.' + o.value; });
  // Enter
  var nodesEnterSelection = nodes.enter()
    .append('g')
    .attr('class', 'node');
  nodesEnterSelection.append('rect')
    .attr('width', sankey.nodeWidth())
    .attr('class', function (d) {
      return d.type + ' ' + d.meta.party.toLowerCase();
    })
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
  // Enter + Update
  nodes
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  nodes.select('rect')
    .attr('height', function (d) {
      return d.dy;
    })
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
};