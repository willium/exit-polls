import d3 from 'd3';
import config from './config';
import UI from './ui';
import { Sankey } from './sankey';
import _ from 'lodash';

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
  
  appendPercent(graph);

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
      return d.sourcePercent + '% of those who answersed "' + d.source.name + '" make up ' + d.targetPercent + '% of the votes for "' + d.target.name + '"';
    });

  links.on('mouseover', function(d) {
    d3.select(this).moveToFront().classed('selected', true);
    d3.selectAll('.label-' + d.meta.id).classed('hidden', false).moveToFront();
  }).on('mouseout', function(d) {
    d3.select(this).classed('selected', false);
    d3.selectAll('.label-' + d.meta.id).classed('hidden', true)
  });
  // Exit
  links.exit().remove();
  
  var linkLabels = linksGroup.selectAll('.link-label')
    .data(duplicate(graph.links), function(d, i) { 
      return d.meta.id + '' + d.version;
    })
    
  // Enter
  var linkLabelEnterSelection = linkLabels.enter();
  
  linkLabelEnterSelection
    .append('g')
      .attr('class', function(d, i) {
        return 'link-label hidden label-' + d.meta.id + ' link-label-source-' + 
          d.meta.source_rank + ' link-label-target-' + d.meta.target_id;
      })
      .append('text')
        .text(function(d, i) {
          return (d.version ? d.sourcePercent : d.targetPercent) + '%';
        })
        .attr('text-anchor', 'middle')
        .attr('dy', 6);

  // Enter + Update
  linkLabels
    .attr('data-type', function(d, i) {
      return (d.version ? 'source' : 'target')
    })
    .attr('transform', function(d, i) {

      let p = svg.append('path').attr('d', function(o){ return path(d); }).style('display', 'none').node();
      let length = p.getTotalLength();
      let point = p.getPointAtLength(location * length);
      p.remove();
      return 'translate(' + point.x + ',' + point.y + ')';
    })

  // Exit
  linkLabels.exit().remove();
  
  // Draw the nodes
  var nodes = nodesGroup.selectAll('.node').data(graph.nodes, function(d) { 
    return d.meta.target_id + '.' + d.meta.source_rank + '.' + d.value; 
  });
  // Enter
  var nodesEnterSelection = nodes.enter()
    .append('g')
    .attr('class', function(d) {
      return 'node ' + d.type + ' ' + d.meta.party.toLowerCase();
    })
    .attr('id', function(d) { return d.type + d.meta.id; })
  
  nodesEnterSelection.append('rect')
    .attr('width', sankey.nodeWidth())
    .append('title');
  
  var nodeTitles = nodesEnterSelection.append('text')
    .attr('class', 'nodeTitle')
    .attr('x', function(d) {
      return _.isEqual(d.type, 'source') ? -config.chart.node.margin : (sankey.nodeWidth() + config.chart.node.margin);
    })
    .attr('dy', '.35em')
    .attr('text-anchor', function(d) {
      return _.isEqual(d.type, 'source') ? 'end' : 'start';
    })
    .attr('transform', null);
    
  var nodeSubtitles = nodesEnterSelection.append('text')
    .attr('class', 'nodeSubtitle')
    .attr('x', function(d) {
      return _.isEqual(d.type, 'source') ? -config.chart.node.margin : (sankey.nodeWidth() + config.chart.node.margin);
    })
    .attr('dy', '.35em')
    .attr('text-anchor', function(d) {
      return _.isEqual(d.type, 'source') ? 'end' : 'start';
    })
    .attr('transform', null);
  
  nodesEnterSelection.on("contextmenu", function(d, i) {
    if (_.isEqual(d.type, 'target')) {
      d3.event.preventDefault();
      d3.selectAll('.selected').classed('selected', false);
      d3.selectAll('.link-label').classed('hidden', true);
      let rm = d3.selectAll('.node.' + d.type + ':not(#' + d.type + d.meta.id + ')');
      if (rm.length > 0) {
        callback(d3.select('.node.' + d.type + '#' + d.type + d.meta.id), d.type, options);
      }
    }
  }).on("click", function(d, i) {
    if (_.isEqual(d.type, 'target')) {
      d3.event.preventDefault();
      d3.selectAll('.selected').classed('selected', false);
      d3.selectAll('.link-label').classed('hidden', true);
      let rm = d3.selectAll('.node.' + d.type + ':not(#' + d.type + d.meta.id + ')');
      if (rm.length > 0) {
        callback(rm, d.type, options);
      }
    }
  });
  
  nodesEnterSelection.on('mouseover', function(d) {
    d3.selectAll('.link')
      .filter(function (o) {
        return (_.isEqual(d.type, 'source') && _.isEqual(o.meta.source_rank, d.meta.source_rank)) ||
          (_.isEqual(d.type, 'target') && _.isEqual(o.meta.target_id, d.meta.target_id));
      }).classed('selected', true);
    
    const labelsClass = d.type === 'source' ? '.link-label-source-' + d.meta.source_rank : 
      '.link-label-target-' + d.meta.target_id;
    d3.selectAll(labelsClass).classed('hidden', function(o) {
      return o[d.type + 'Percent'] < 10 && _.isEqual(d3.select(this).attr('data-type'), d.type);
    }).moveToFront();
  }).on('mouseout', function(d) {
    d3.selectAll('.selected').classed('selected', false);
    
    const labelsClass = d.type === 'source' ? '.link-label-source-' + d.meta.source_rank : 
      '.link-label-target-' + d.meta.target_id;
    d3.selectAll(labelsClass).classed('hidden', true);
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
      if (_.isEqual(d.type, 'target')) {
        return 'Click to Focus\nRight Click to Remove';
      } else {
        return d.name;
      }
    });
  
  nodeTitles.attr('y', function(d) {
      return d.dy / 2 - 11;
    })
    .text(function(d) {
      return d.name;
    })
  
  nodeSubtitles.attr('y', function(d) {
      return d.dy / 2 + 11;
    }).text(function(d) {
      return d.percent + '%';
    })
  // Exit
  nodes.exit().remove();
  
  return shelf;
};

function appendPercent(graph) {
  _.forEach(graph.nodes, function(d) {
    let totalValue = 0;
    const peerNodes = _.filter(graph.nodes, function(o) {
      return _.isEqual(o.type, d.type);
    });
    _.forEach(peerNodes, function(d) {
      totalValue += d.value;
    })
    d.percent = Math.round(d.value / totalValue * 100);
  });
  
  _.forEach(graph.links, function(d) {
    d.sourcePercent = Math.round(d.value / d.source.value * 100);
    d.targetPercent = Math.round(d.value / d.target.value * 100);
  });
}

function duplicate(arr) {
  let newArr = [];
  
  _.forEach(arr, function(v, i) {
    let item1 = _.clone(v);
    item1.version = 0;
    
    let item2 = _.clone(v);
    item2.version = 1;
    
    newArr.push(item1);
    newArr.push(item2);
  });
  
  return newArr;
}