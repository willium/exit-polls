// Function takes n arguments and returns the first one (in-order) that isn't undefined.
// if all arguments are undefined, returns null
var which = function which() {
  for (var i=0; i < arguments.length; i++) {
    if (typeof arguments[i] != 'undefined') {
      return arguments[i];
    }
  }
  
  return null;
}