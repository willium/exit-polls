import d3 from 'd3';
import config from './config';
import { which } from './util';

let data, render;
let filter = {'states': [], 'candidates': [], 'answers': []};
let questions, bin; // TODO: make these less global

// start the UI render
export function load(d, r) {
  render = r;
  data = d;
  
  var parties = d3.keys(data); 
  var partyChoice = createChoice('parties', parties);
  partyChoice.on('change', updateParty);
  
  // on first render, use default party
  updateParty();
}

function updateParty(el) {
  var party = d3.select('input[name^="parties"]:checked').node().value;
  filter.party = party;
  
  questions = loadQuestions(data[party]);
  var topLevel = d3.keys(questions);
  var questionChoice = createChoice('questions', topLevel); 
  questionChoice.on('change', updateBins);
  
  // on first render, use default question (i=0)
  updateBins();
}

function updateBins(el) {
  var question = d3.select('input[name^="questions"]:checked').node().value;
  var bins = questions[question];
  
  if (_.isEqual(bins.length, 1)) {
    bin = bins[0]['id'];
    showBins(false);
  } else {
    bin = null;
    showBins(true);
    bins = _.forEach(questions[question], function(o, i) { o.name = 'Option ' + _.add(1,i) });
    var binChoice = createChoice('bins', bins);
    binChoice.on('change', updateQuestion);
  }
  updateQuestion();
}

function showBins(show) {
  var filters = d3.select('#filters');
  var bins = filters.select('#bins');
  if (show && bins.empty()) {
    filters
      .insert('div', '#questions + *') // after questions
      .attr('id', 'bins')
      .attr('class', 'filter');
  } else if (!show) {
    bins.remove();
  }
}

function updateQuestion(el) {
  filter.question = bin || d3.select('input[name^="bins"]:checked').node().value;

  var candidateOptions = createOptions('candidates', data[filter.party][filter.question]['candidates']); 
  candidateOptions.on('change', updateCandidates);
  updateCandidates(); // on first render, use default candidates (all)
  
  var stateOptions = createOptions('states', loadStates(data[filter.party][filter.question])); 
  stateOptions.on('change', updateStates);
  updateStates(); // on first render, use default states (all)
  
  var answerOptions = createOptions('answers', loadAnswers(data[filter.party][filter.question])); 
  answerOptions.on('change', updateAnswers);
  updateAnswers(); // on first render, use default answers (all)
  
  render(filter);
}

function updateCandidates(el) {
  filter.candidates = [];
  // iterate through all unchecked candidate checkboxes
  d3.selectAll('input[name^="candidates"]:checked').each(function(selection) {
    filter.candidates.push(selection.id);
  });
  
  // if not first render, trigger re-render
  if (!_.isUndefined(el)) {
    render(filter);
  }
}

function updateStates(el) {
  filter.states = [];
  // iterate through all unchecked states checkboxes
  d3.selectAll('input[name^="states"]:checked').each(function(selection) {
    filter.states.push(selection);
  });
  
  // if not first render, trigger re-render
  if (!_.isUndefined(el)) {
    render(filter);
  }
}

function updateAnswers(el) {
  filter.answers = [];
  // iterate through all unchecked answers checkboxes
  d3.selectAll('input[name^="answers"]:checked').each(function(selection) {
    filter.answers.push(selection.id);
  });
  
  // if not first render, trigger re-render
  if (!_.isUndefined(el)) {
    render(filter);
  }
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

// returns states from data as array with no duplicates
function loadStates(data) {
  var states = [];

  data['answers'].forEach(function(value, index, arr) {
    if(!_.includes(states, value.state)) {
      states.push(value.state);
    }
  });
  
  return states;
}

// returns answers from data as array with no duplicates
function loadAnswers(data) {
  var answers = [];
  
  data['answers'].forEach(function(value, index, arr) {
    if(_.findIndex(answers, function(o) { return _.isEqual(o.name, value.source); }) === -1) {
      answers.push({
        'id': value.source_rank,
        'name': value.source
      });
    }
  });
  
  return answers;
}

// create radio buttons
function createChoice(name, data) {
  data = _.orderBy(data, function(d) {
    return which(d.name, d.id, d);
  });
  
  var div = d3.select('#' + name);
  div.select('form').remove();
  var form = div.append('form');
  var labels = form.selectAll('label')
    .data(data, function(d) {
      return which(d.id, d);
    })
    .enter()
    .append('label')
      .text(function(d) {
          return which(d.name, d);
        })
      .attr('class', 'label-' + name)
      .attr('name', name)
            
  var inputs = labels.insert('input')
    .attr({
        type: 'radio',
        class: name,
        name: name,
        id: function(d) {
          return which(d.id, d);
        },
        value: function(d) {
          return which(d.id, d);
        },
    })
    .property('checked', function(d, i) { return _.isEqual(i,0); })
    
  labels.append('br');
  
  return inputs;  
}

// create checkboxes
function createOptions(name, data) {
  data = _.orderBy(data, [function(d) { return _.isEqual(name, 'candidates') ? (!_.includes(config.data.current_candidates, d.id)) : which(d.name, d.id, d); }, 'name']);

  var div = d3.select('#' + name);
  div.select('form').remove();
  var form = div.append('form');
  var labels = form.selectAll('label')
    .data(data, function(d) {
      return which(d.id, d);
    })
    .enter()
    .append('label')
      .text(function(d) {
          return which(d.name, d);
        })
      .attr('class', 'label-' + name)
      .attr('name', function(d) {
        return name +  '-' + which(d.id, d);
      })
      
  var inputs = labels.insert('input')
    .attr({
        type: 'checkbox',
        class: name,
        name: function(d) {
          return name + '-' + which(d.id, d);
        },
        id: function(d) {
          return which(d.id, d);
        },
        value: function(d) {
          return which(d.id, d);
        },
    })
    .property('checked', function(d) {
      return _.isEqual(name, 'candidates') ? (_.includes(config.data.current_candidates, d.id)) : true;
    })
  
  labels.append('br');
  
  return inputs;
}