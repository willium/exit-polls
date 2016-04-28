import d3 from 'd3'
import { which } from './util'

let data, render;
let filter = {'states': [], 'candidates': [], 'answers': []};

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
  
  var questionChoice = createChoice('questions', loadQuestions(data[party])); 
  questionChoice.on('change', updateQuestion);
  
  // on first render, use default question (i=0)
  updateQuestion();
}

function updateQuestion(el) {
  var question = d3.select('input[name^="questions"]:checked').node().value;    
  filter.question = question;
  
  var candidateOptions = createOptions('candidates', data[filter.party][question]['candidates']); 
  candidateOptions.on('change', updateCandidates);
  updateCandidates(); // on first render, use default candidates (all)
  
  var stateOptions = createOptions('states', loadStates(data[filter.party][question])); 
  stateOptions.on('change', updateStates);
  updateStates(); // on first render, use default states (all)
  
  var answerOptions = createOptions('answers', loadAnswers(data[filter.party][question])); 
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
  if (typeof el !== 'undefined') {
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
  if (typeof el !== 'undefined') {
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
  if (typeof el !== 'undefined') {
    render(filter);
  }
}

// returns questions from data in friendly form
function loadQuestions(data) {
  var qs = [];
  var keys = d3.keys(data);
  
  for(var i=0; i < keys.length; i++) {
    qs.push({
      'id': keys[i],
      'name': data[keys[i]]['question']
    })
  }
  
  return qs;
}

// returns states from data as array with no duplicates
function loadStates(data) {
  var states = [];

  data['answers'].forEach(function(value, index, arr) {
    if(states.indexOf(value.state) === -1) {
      states.push(value.state);
    }
  });
  
  return states;
}

// returns answers from data as array with no duplicates
function loadAnswers(data) {
  var answers = [];
  
  data['answers'].forEach(function(value, index, arr) {
    if(_.findIndex(answers, function(o) { return o.id == value.source_rank && o.name == value.source; }) === -1) {
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
          return which(d.name, d) + ' ['+which(d.id, d)+']';
        })
      .attr('class', 'label-'+name)
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
    .property('checked', function(d, i) {return i===0;})
    
  labels.append('br');
  
  return inputs;  
}

// create checkboxes
function createOptions(name, data) {
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
          return which(d.name, d) + ' ['+which(d.id, d)+']';
        })
      .attr('class', 'label-'+name)
      .attr('name', function(d) {
        return name+'-'+which(d.id, d);
      })
      
  var inputs = labels.insert('input')
    .attr({
        type: 'checkbox',
        class: name,
        name: function(d) {
          return name+'-'+which(d.id, d);
        },
        id: function(d) {
          return which(d.id, d);
        },
        value: function(d) {
          return which(d.id, d);
        },
    })
    .property('checked', true)
  
  labels.append('br');
  
  return inputs;
}