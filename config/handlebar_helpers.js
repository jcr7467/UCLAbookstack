module.exports = {
    user_is_logged_in: function(userID){
        return userID != null;

    },

    greater_than_zero: function(count){
        /*
        * Used in /profile to either display books or display that they dont have any books
        * */
        return (count > 0);
    },
    equal_strings: function(expected, actual){
        return (expected === actual);
    }
}



/*
*
* module.exports = {
  ifeq: function(a, b, options){
    if (a === b) {
      return options.fn(this);
      }
    return options.inverse(this);
  },
  bar: function(){
    return "BAR!";
  }
}
*
*
*
* */