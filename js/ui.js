d3.json('../source/data.json', function(error, data) {
  if (error) return console.warn(error);
  
  var partial = {
    'party': {},
    'question': {}
  };
  
  loadUI();
  
  function loadUI() {
    var parties = d3.keys(data);
    
    var partyChoice = createChoice('parties', parties);
    partyChoice.on('change', updateParty);
    updateParty();
  }

  function updateParty(el) {
    var party = which(this.value, d3.select('input[name="parties"]:checked').node().value);
    partial['party'] = data[party];
   
    var questionChoice = createChoice('questions', loadQuestions(partial['party'])); 
    questionChoice.on('change', updateQuestion);
    updateQuestion();
  }
  
  function updateQuestion(el) {
    var question = which(this.value, d3.select('input[name="questions"]:checked').node().value);
    partial['question'] = partial['party'][question];
    
    var candidateOptions = createOptions('candidates', partial['question']['candidates']); 
    candidateOptions.on('change', updateCandidates);
    updateCandidates();
    
    var stateOptions = createOptions('states', loadStates(partial['question'])); 
    stateOptions.on('change', updateStates);
    updateStates();
    
    renderChart(partial['question']['answers']);
  }
  
  function updateCandidates(el) {
    d3.select('input[name="candidates"]:not(:checked)').each(function() {
      var input = this;
      partial['question']['answers'] = partial['question']['answers'].filter(function(d){
        return d.target_id !== which(el.id, input.id);
      })
    });
    
    if (typeof el != 'undefined') {
      renderChart(partial['question']['answers']);
    }
  }
  
  function updateStates(el) {
    d3.select('input[name="states"]:not(:checked)').each(function() {
      var input = this;
      partial['question']['answers'] = partial['question']['answers'].filter(function(d){
        return d.state !== which(el.id, input.id);
      })
    });
    
    if (typeof el != 'undefined') {
      renderChart(partial['question']['answers']);
    }
   }

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
  
  function loadStates(data) {
    var states = [];
    
    data['answers'].forEach(function(value, index, arr) {
      if(states.indexOf(value.state) === -1) {
        states.push(value.state);
      }
    });
    
    return states;
  }
  
  function triggerChange(d, i) {
    console.log('trigger', this, d, i);
  }

  function which() {
    for (var i=0; i < arguments.length; i++) {
      if (typeof arguments[i] != 'undefined') {
        return arguments[i];
      }
    }
    
    return null;
  }
  
  // radio button
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
        .attr('class', 'label-'+name);
              
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
      .on('change', triggerChange);
     
    labels.append('br');
    
    return inputs;  
  }
  
  // checkboxes
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
        
    var inputs = labels.insert('input')
      .attr({
          type: 'checkbox',
          class: name,
          name: name,
          id: function(d) {
            return which(d.id, d);
          },
          value: function(d) {
            return which(d.id, d);
          },
      })
      .property('checked', true)
      .on('change', triggerChange);
    
    labels.append('br');
    
    return inputs;
  }

});