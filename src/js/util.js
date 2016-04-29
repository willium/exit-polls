import d3 from 'd3';

// Function takes n arguments and returns the first one (in-order) that isn't undefined.
// if all arguments are undefined, returns null
export function which() {
  for (var i=0; i < arguments.length; i++) {
    try {
      if (typeof arguments[i] != 'undefined') {
        return arguments[i];
      }
    } catch(e) {
      // trying to access property of undefined, most likely
    }
  }
  
  return null;
}

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};