

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
    },

    //Files used in:
    // views/search_for_books.hbs, to select the page limit dynamically
    selectSelected:function(selected, options) {

        return options.fn(this).replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"');

    },
    selectSelectedByID:function(selected, options) {

        return options.fn(this).replace(
            new RegExp(' id=\"' + selected + '\"'),
            '$& selected="selected"');

    },
    hasFlashContent: function(flashObject, expectedTypeOfFlash) {
        /*
        *  This helper function checks for three types of flash objects, for
        * 1. Notice
        * 2. Error
        * 3. Success
        *
        * */



        //If we ever want to add types of flash messages, we would just add it here
        switch (expectedTypeOfFlash) {
            case 'isNotice':
                return (flashObject && flashObject.notice && flashObject.notice.length > 0)
            case 'isError':
                return (flashObject && flashObject.error && flashObject.error.length > 0)
            case 'isSuccess':
                return (flashObject && flashObject.success && flashObject.success.length > 0)
            default:
                return false
        }

    },
    notHelper: function(bool){
        return !bool;
    },
    turnSubjectAreaArrayIntoURLParameters: function(arrayOfSAs){
        // If it is an array, then there are multiple subject Areas
        if (Array.isArray(arrayOfSAs)){

            if (arrayOfSAs.length === 1 && arrayOfSAs[0] !== 'All'){
                return 'subject=' + arrayOfSAs[0]
            }

            let parameterArray = []

            for (let i = 0 ; i < arrayOfSAs.length ; i ++){
                let subjectAreaPrefix = 'subject=';
                let subjectAreaFull;

                // We have this check so that we don't append 'all' to the url.
                // This would cause an issue with autochecking each subject inside the url to the collapse menu
                //because 'All' is not a checkbox, it would throw an error and not continue the autochecking on reload
                if (arrayOfSAs[i] !== 'All'){
                    if (i !== arrayOfSAs.length - 1){
                        subjectAreaFull = subjectAreaPrefix + arrayOfSAs[i] + '&';
                    }else{
                        subjectAreaFull = subjectAreaPrefix + arrayOfSAs[i];
                    }
                    parameterArray.push(subjectAreaFull)
                }
            }

            return parameterArray.join('')

        }else if (arrayOfSAs !== 'All'){//If there it is not, then there is only one subject area
            //But only return if the subject is not 'all' because if we have all as a parameter
            // as well as other subjects, then it's the same as just asking for all the books
            // If it is all, then the url will look something like '/search/1?query=&&limit=12' with 2 &'s
            return 'subject=' + arrayOfSAs
        }


    }

}