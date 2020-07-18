

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
        console.log('Val1: ', expected)
        console.log('Val2: ', actual)

        return (expected === actual);
    },
    equal_strings_soft: function(expected, actual){
        console.log('Val1: ', expected)
        console.log('Val2: ', actual)

        return (expected == actual);
    },
    add_me_together: function(val1){
        return parseInt(val1) + 1

    },
    isNew: function (dateAdded) {
        //If the book is less than a week old, it will have a new stamp on it
        let currentTime = Date.now();

        //604800000 is 1 week in milliseconds
        return (currentTime - dateAdded < 604800000)

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