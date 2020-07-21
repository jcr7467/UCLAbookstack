

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
    },
    equal_strings_soft: function(expected, actual){
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

    },
    convertToStringMonth: function(monthInt){

        let month_string = ""

        switch(monthInt) {
            case 0:
                month_string = "January"
                break;
            case 1:
                month_string = "February"
                break;
            case 2:
                month_string = "March"
                break;
            case 3:
                month_string = "April"
                break;
            case 4:
                month_string = "May"
                break;
            case 5:
                month_string = "June"
                break;
            case 6:
                month_string = "July"
                break;
            case 7:
                month_string = "August"
                break;
            case 8:
                month_string = "September"
                break;
            case 9:
                month_string = "October"
                break;
            case 10:
                month_string = "November"
                break;
            default:
                month_string = "December"

        }

        return month_string
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