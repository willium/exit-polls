// prefer vars
var which = function which() {
  for (var i=0; i < arguments.length; i++) {
    if (typeof arguments[i] != 'undefined') {
      return arguments[i];
    }
  }
  
  return null;
}