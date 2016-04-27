// load data from JSON
d3.json('../source/data.json', function(error, data) {
  if (error) return console.warn(error);
  
  // for tracking throughout
  var partial = {
    'party': {},
    'question': {}
  };
    
  loadUI();
  
  // start the UI render
  function loadUI() {
    var parties = d3.keys(data);
    
    var partyChoice = createChoice('parties', parties);
    partyChoice.on('change', updateParty);
    updateParty(); // on first render, use default party
  }

  function updateParty(el) {
    var party = which(this.value, d3.select('input[name^="parties"]:checked').node().value);
    partial['party'] = data[party];
   
    var questionChoice = createChoice('questions', loadQuestions(partial['party'])); 
    questionChoice.on('change', updateQuestion);
    updateQuestion(); // on first render, use default question (i=0)
  }
  
  function updateQuestion(el) {
    var question = which(this.value, d3.select('input[name^="questions"]:checked').node().value);
    partial['question'] = partial['party'][question];
    
    var candidateOptions = createOptions('candidates', partial['question']['candidates']); 
    candidateOptions.on('change', updateCandidates);
    updateCandidates(); // on first render, use default candidates (all)
    
    var stateOptions = createOptions('states', loadStates(partial['question'])); 
    stateOptions.on('change', updateStates);
    updateStates(); // on first render, use default states (all)
    
    partial['question']['answers'] = render(partial['question']['answers']);
  }
  
  function updateCandidates(el) {
    // iterate through all unchecked candidate checkboxes
    d3.select('input[name^="candidates"]:not(:checked)').each(function(selection) {
      // filter data based on unchecked checkboxes
      partial['question']['answers'] = partial['question']['answers'].filter(function(d) {
        return d.target_id !== selection.id;
      })
    });
    
    // if not first render, trigger re-render
    if (typeof el !== 'undefined') {
      partial['question']['answers'] = render(partial['question']['answers']);
    }
  }
  
  function updateStates(el) {
    // iterate through all unchecked states checkboxes
    d3.select('input[name^="states"]:not(:checked)').each(function(selection) {
     // filter data based on unchecked checkboxes
     partial['question']['answers'] = partial['question']['answers'].filter(function(d) {
        return d.state !== selection;
      })
    });
    
    // if not first render, trigger re-render
    if (typeof el !== 'undefined') {
      partial['question']['answers'] = render(partial['question']['answers']);
    }
  }
  
  // returns questions from data in friendly form
  function loadQuestions(data) {
    var qs = [];
    keys = d3.keys(data);
    
    for(var i=0; i < keys.length; i++) {
      qs.push({
        'id': keys[i],
        'question': data[keys[i]]['question']
      })
    }
   
    return qs;
  }
  
  // returns questions from data as array with no duplicates
  function loadStates(data) {
    var states = [];
    
    data['answers'].forEach(function(value, index, arr) {
      if(states.indexOf(value.state) === -1) {
        states.push(value.state);
      }
    });
    
    return states;
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
            return which(d.name, d.question, d) + ' ['+which(d.id, d)+']';
          })
        .attr('class', 'label-'+name)
        .attr('name', name)
              
    inputs = labels.insert('input')
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
            return which(d.name, d.question, d) + ' ['+which(d.id, d)+']';
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

});