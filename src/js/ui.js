import d3 from 'd3';
import config from './config';
import { cloneSelection } from './util';

let filter, shelf, data, render, options;
let questions;

// start the UI render
export function load(d, r, o) {
  data = d;
  render = r;
  options = o;
  filter = !_.isUndefined(options) ? options.filter : _.clone(config.defaultFilter);
  shelf = !_.isUndefined(options) ? options.shelf : _.clone(config.defaultFilter);
  
  const parties = d3.keys(data); 
  renderParties(parties, updateParty);
}

function updateParty(el) {
  const party = el || d3.select('input[name^="parties"]:checked').node().value;
  filter.party = party;
  
  questions = loadQuestions(data[party]);
  renderQuestions(d3.keys(questions), updateQuestion); 
}

// returns questions from data in friendly form
function loadQuestions(data) {
  let qs = [];
  
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

function updateBins(el, idx) {

}

function updateQuestion(el, idx, bin) {
  let dropdown = d3.select('.questions-select');
  const question = dropdown.property('value');
  
  // save a reference to a cloned element that can be measured
  const $tempWidth = d3.select('#questions').append('select')
    .attr('class', 'questions-select')
  $tempWidth.selectAll('option').remove();
  $tempWidth.append('option').text(question);
  
  // calculate the width of the clone
  const width = $tempWidth.node().getBoundingClientRect().width;

  // remove the clone from the DOM
  $tempWidth.remove();
  
  dropdown.style('width', 20 + width + 'px');
  
  let bins = questions[question];
  
  bins = _.orderBy(bins, function(b) {
    let numSources = _.uniqBy(data[filter.party][b['id']]['answers'], function(d) {
      return d['source'];
    }).length;
    return numSources;
  }, ['desc']);
  filter.question = bins[0]['id'];

  // render shelf with all candidates not checked who are available(default all candidates not still running)
  // update state filter to remove all non available states
  // render shelf with available states without states in filter
    
  let availableCandidates = _.uniq(_.map(data[filter.party][filter.question]['answers'], 'target_id'));
  let defaultCandidates = _.filter(config.data.currentCandidates, function(d) {
     return _.includes(availableCandidates, d);
  });
  let candidateIntersect = _.intersection(filter.candidates, availableCandidates);
  filter.candidates = !_.isEqual(candidateIntersect.length, 0) ? candidateIntersect : defaultCandidates;
  shelf.candidates = _.filter(availableCandidates, function(d) {
     return !_.includes(filter.candidates, d);
  });
  
  let rows = _.filter(data[filter.party][filter.question]['answers'], function(d) {
    return _.includes(filter.candidates, d.target_id);
  });
  
  // states
  let availableStates = _.uniq(_.map(rows, 'state'))
  filter.states = availableStates;
  
  renderStates(availableStates, updateStates);
  
  // answers
  let availableAnswers = _.uniq(_.map(rows, 'source_rank'));
  
  if (!_.isUndefined(options) && _.isUndefined(el)) {
    let answerIntersect = _.intersection(availableAnswers, filter.answers);
    filter.answers = !_.isEqual(answerIntersect.length, 0) ? answerIntersect : availableAnswers;
  } else {
    filter.answers = availableAnswers;
  }
  shelf.answers = _.filter(availableAnswers, function(d) {
   return !_.includes(filter.answers, d);
  }) 
    
  renderShelf(shelf, data[filter.party][filter.question]['answers'], updateShelf);
  render({'filter': filter, 'shelf': shelf});
}

function updateShelf(el) {
  if(_.isEqual(el.itemType, 'answers') && !_.includes(filter.answers, el.value)) {
    filter.answers.push(el.value);
    _.remove(shelf.answers, function(d) { return _.isEqual(d, el.value); });
  }
  
  if(_.isEqual(el.itemType, 'candidates') && !_.includes(filter.candidates, el.value)) {
    filter.candidates.push(el.value);
    _.remove(shelf.candidates, function(d) { return _.isEqual(d, el.value); });
  }
  
  d3.select(this).remove();
  render({'filter': filter, 'shelf': shelf});
}

function updateStates(el) {
  filter.states = [];
  
  d3.selectAll('.state input:checked').each(function(o) {
    filter.states.push(o);
  });

  if (!_.isUndefined(el)) {
    render({'filter': filter, 'shelf': shelf});
  }
}

function renderParties(partiesData, fn) {
  partiesData = _.orderBy(partiesData, ['name']);

  const partiesSwitch = d3.select('#parties-switch')
  
  const party = partiesSwitch.selectAll('.party')
    .data(partiesData, function(d) { return d; })
    .enter()
    .append('div')
      .attr('class', 'party')
      .attr('id', function(d) { return d.toLowerCase(); })
  
  const inputs = party.append('input')
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
  
  const dropdown = d3.select('.questions-select').on('change', fn);
  
  const options = dropdown.selectAll('option')
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

function renderStates(states, fn) {  
  states = _.sortBy(states);

  const statesSelect = d3.select('#states-select')
  
  const state = statesSelect.selectAll('.state')
    .data(states, function(d) { return d; })
  
  const stateEnter = state.enter()
    .insert('div', '.legend')
      .attr('class', 'state box')
      .attr('title', 'Black = On\nGray = Off')
      .attr('id', function(d) { return d.toLowerCase(); })
  
  const inputs = stateEnter.append('input')
    .attr('type', 'checkbox')
    .attr('id', function(d) { return 'state-' + d.toLowerCase(); })
    .attr('name', function(d) { return 'state-' + d.toLowerCase(); })
    .attr('value', function(d) { return d; })
    .property('checked', function(d, i) { return true; })
    .on('change', fn);
  
  stateEnter.append('label')
    .attr('for', function(d) { return 'state-' + d.toLowerCase(); })
    .text(function(d) { return d; })
    
  state.exit().remove();
  
  fn();
  return states;
}

function renderShelf(shelf, answers, fn) {
  let items = []
  
  _.forEach(shelf, function(v1, k) {
    _.forEach(v1, function(v2, i) {
      let shelfItem = {};
      shelfItem.itemType = k;
      shelfItem.value = v2;
      shelfItem.index = i;
      items.push(shelfItem);
    }) 
  })
  
  const shelfItems = d3.select('#shelf-items');
  
  const item = shelfItems.selectAll('.item')
    .data(items, function(d) { return d.itemType + d.value })
  
  const itemEnter = item.enter()
    .insert('div', '.legend')
      .attr('data-id', function(d, i) { 
        return d.index; 
      })
      .attr('data-type', function(d, i) { 
        return d.itemType; 
      })
      .attr('title', 'Click to Add to Visualization')
      .text(function(d) { 
        return _.isEqual(d.itemType, 'candidates') ? _.find(answers, ['target_id', d.value]).target : _.find(answers, ['source_rank', d.value]).source;
      })
      .on('click', fn);
      
  item
    .attr('class', function(d) {
      return 'item box ' + d.itemType + (_.isEqual(d.itemType, 'candidates') ? ' ' + _.find(answers, ['target_id', d.value]).party.toLowerCase() : '');
    })
  
  item.exit().remove();
}