import d3 from 'd3';
import config from './config';
import { which } from './util';

let filter, shelf, data, render;
let questions;

// start the UI render
export function load(d, r, options) {
  data = d;
  render = r;
  filter = !_.isUndefined(options) ? options.filter : _.clone(config.defaultFilter);
  shelf = !_.isUndefined(options) ? options.shelf : _.clone(config.defaultFilter);
  
  var parties = d3.keys(data); 
  renderParties(parties, updateParty);
}

function updateParty(el) {
  var party = el || d3.select('input[name^="parties"]:checked').node().value;
  filter.party = party;
  
  questions = loadQuestions(data[party]);
  renderQuestions(d3.keys(questions), updateBins); 
}

// returns questions from data in friendly form
function loadQuestions(data) {
  var qs = [];
  
  _.forEach(d3.keys(data), function (key, i) {
    qs.push({
      'id': key,
      'name': data[key]['question']
    })
  });
  
  qs = d3.nest()
    .key(function(d) {return d.name; })
    .map(qs);
      
  return qs;
}

function updateBins(el) {
  var question = d3.select('#questions-select').property('value');
  var bins = questions[question];
  
  renderBins(bins, updateQuestion);
}

function updateQuestion(el, idx, bin) {
  filter.question = bin || d3.select('input[name^="bins"]:checked').node().value;

  // render shelf with all candidates not checked who are available(default all candidates not still running)
  // update state filter to remove all non available states
  // render shelf with available states without states in filter
    
  let availableCandidates = _.uniq(_.map(data[filter.party][filter.question]['answers'], 'target_id'));
  
  let candidateIntersect = _.intersection(filter.candidates, availableCandidates);
  filter.candidates = !_.isEqual(candidateIntersect.length, 0) ? candidateIntersect : config.data.currentCandidates; 
  shelf.candidates = _.without(availableCandidates, filter.candidates);
  
  let rows = _.filter(data[filter.party][filter.question]['answers'], function(d) {
    return _.includes(filter.candidates, d.target_id);
  });
  
  let availableStates = _.uniq(_.map(rows, 'state'));
  
  let stateIntersect = _.intersection(availableStates, filter.states);
  filter.states = !_.isEqual(stateIntersect.length, 0) ? stateIntersect : availableStates;
  shelf.states = _.without(availableStates, filter.states); 
  
  let availableAnswers = _.uniq(_.map(rows, 'source_rank'));
  let answerIntersect = _.intersection(availableAnswers, filter.answers);
  filter.answers = !_.isEqual(answerIntersect.length, 0) ? answerIntersect : availableAnswers;
  shelf.answers = _.without(availableAnswers, filter.answers); 

  logger.log('Pre-render', 'Shelf', shelf);
  logger.log('Pre-render', 'Filter', filter);
  render({'filter': filter, 'shelf': shelf});
}

function renderParties(partiesData, fn) {
  partiesData = _.orderBy(partiesData, ['name']);

  var partiesSwitch = d3.select('#parties-switch')
  
  var party = partiesSwitch.selectAll('.party')
    .data(partiesData, function(d) { return d; })
    .enter()
    .append('div')
      .attr('class', 'party')
      .attr('id', function(d) { return d.toLowerCase(); })
  
  var inputs = party.append('input')
    .attr('type', 'radio')
    .attr('id', function(d) { return 'party-' + d.toLowerCase(); })
    .attr('name', 'parties')
    .attr('value', function(d) { return d; })
    .property('checked', function(d, i) { return _.isEqual(i, 0); })
    .on('change', fn);
  
  party.append('label')
    .attr('for', function(d) { return 'party-' + d.toLowerCase(); })
    .text(function(d) { return _.isEqual(d, 'R') ? 'Republicans' : 'Democrats'; })
  
  fn();
  return partiesData;
}

function renderQuestions(questionsData, fn) {
  questionsData = questionsData.sort();
  
  var dropdown = d3.select('#questions-select').on('change', fn);
  
  var options = dropdown.selectAll('option')
    .data(questionsData, function(d) { return d; })
   
  options.enter()
    .append('option')    
      .text(function(d) { return d; })
      .attr('value', function(d) { return d; })
      .property('selected', function(d, i) { return _.isEqual(i, 0); })

  options.exit().remove();
  
  fn();
  return questionsData;
}

function renderBins(binsData, fn) {
  var bins = d3.select('#bins');
  if (binsData.length <= 1) {
    bins.attr('class', 'hidden');
    if (!_.isUndefined(binsData[0])) {
      fn(undefined, undefined, binsData[0].id);
    }
  } else {
    bins.attr('class', null);
  
    var binsSwitch = bins.select('#bins-switch');
    
    var bin = binsSwitch.selectAll('.bin')
      .data(binsData, function(d) { return d.id; })
    
    var binEnter = bin.enter()
      .append('span')
        .attr('class', 'bin')
    
    var inputs = binEnter.append('input')
      .attr('type', 'radio')
      .attr('id', function(d, i) { return 'v' + i; })
      .attr('name', 'bins')
      .attr('value', function(d) { return d.id; })
      .property('checked', function(d, i) { return _.isEqual(i, 0); })
      .on('change', fn);
    
    binEnter.append('label')
      .attr('for', function(d, i) { return 'v' + i; })
      .text(function(d, i) { return i + 1; });
    
    bin.exit().remove();
    
    fn(undefined, undefined, false);    
  }
  
  return binsData;
}