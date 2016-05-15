import d3 from 'd3';
import _ from 'lodash';

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {  
  return this.each(function() { 
    const firstChild = this.parentNode.firstChild; 
    if (firstChild) { 
      this.parentNode.insertBefore(this, firstChild); 
    } 
  });
};

export function cloneSelection(appendTo, toCopy, times) {
  toCopy.each(function() {
    for (let i = 0; i < times; i++) {
      let clone = appendTo.node().appendChild(this.cloneNode(true));
      d3.select(clone).attr("class", "clone").attr("id", "clone-" + i);
    }
  });
  return appendTo.selectAll('.clone');
}