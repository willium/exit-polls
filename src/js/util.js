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