d3.json('../source/meta.json', function(error, meta) {
  var parties = d3.keys(meta);
  var partyChoice = createChoice('parties', parties);
  partyChoice.on('change', updateParty);
  updateParty();

  function updateParty(v) {
    var party = which(this.value, d3.select('input[name="parties"]:checked').node().value);
    generateUI(party);
    updateChart({});
  }

  function generateUI(party) {
    console.log('generating UI for:' + party);
    
    createOptions('candidates', meta[party]['candidates']);    
    createChoice('questions', meta[party]['questions']);    
    createOptions('states', meta[party]['states']);    
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