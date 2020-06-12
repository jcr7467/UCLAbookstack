module.exports = {
    title_is_home: function (title) {
        return (title === 'Home')
    },
    navbar_requested_is_clear: function (navbar_type) {
        return (navbar_type == 'clear')
    },
    navbar_requested_is_dark: function (navbar_type) {
        return (navbar_type == 'dark')
    },
    navbar_requested_is_default: function (navbar_type) {
        return (navbar_type == 'default')
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