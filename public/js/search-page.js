/*
*
* This function finds if the specific combination of
* 'parameter_name' with value of 'parameter_value' is found in the url.
*
* If it is found, it returns it's index within the other parameters
* If it is not found, then it simply returns -1
*
* */
function URLParametersContained_returnIndex(parameter_name, parameter_value){

    let url = window.location.href;// Returns full URL (https://example.com/path/example.html)
    let split_url = url.split('?');

    // If there are no parameters
    if (split_url.length === 1){
        return -1;
    }else{

        let url_parameters = split_url[1];
        let split_parameters = url_parameters.split('&');
        let searchingForThisParameter = parameter_name + '=' + parameter_value;

        // Returns what index our parameter we are searching for is located at
        // If not in array, returns -1
        return $.inArray(searchingForThisParameter, split_parameters)
    }
}





/*
* This function removes a url parameter at a specific index,
*  and then returns a string representing the new parameters without the one we removed
* */
function removeURLParameterAtIndex_returnNewParameters(index){

    let url = window.location.href;
    let split_url = url.split('?');

    if(split_url.length > 1){
        let url_parameters = split_url[1];
        let split_parameters = url_parameters.split('&');

        // Start at index # 'index' and only delete 1
        split_parameters.splice(index, 1)

        return split_parameters.join('&')

    }
}





/*
*
* This function is basically the wrapper function for all the functionality
* This calls removeURLParameterAtIndex_returnNewParameters and calls URLParametersContain_returnIndex.
* This function takes two parameters, a parameter name and a parameter value, and if that value is found in the url,
*  it will remove it from the url and redirect to the new url without that parameter
*
* */
function removeParameterIfFound_andRedirect(parameter_name_searched_for, parameter_value_searched_for){

    //Because some subject areas' abbreviations include an amprisand, we need to replace all '&' with '%26' and search the url for that
    parameter_value_searched_for = parameter_value_searched_for.replace(/&/g, '%26');
    let parameter_found_at_index = URLParametersContained_returnIndex(parameter_name_searched_for, parameter_value_searched_for);

    // Meaning, it was found
    if (parameter_found_at_index !== -1){
        let new_parameters = removeURLParameterAtIndex_returnNewParameters(parameter_found_at_index)
        let pathname = window.location.pathname; // Returns path only (/path/example.html)
        let origin   = window.location.origin;   // Returns base URL (https://example.com)
        let new_url = origin + pathname + '?' + new_parameters
        window.location.replace(new_url)

    }
}





/*
*
* This function appends the requested parameter to the back of the current url and returns the new url
*
* */
function addURLParameter_returnNewParameters(parameter_name_hoping_to_insert, parameter_value_hoping_to_insert){
    let url = window.location.href;
    let split_url = url.split('?');


    if (split_url.length === 1){ // if length equals 1, meaning if only the pathname and origin are the first element, and there are no parameters

        return parameter_name_hoping_to_insert + '=' + parameter_value_hoping_to_insert;

    }else { // if there is at least one parameter
        let url_parameters = split_url[1];

        return url_parameters + '&' + parameter_name_hoping_to_insert + '=' + parameter_value_hoping_to_insert
    }
}





/*
*
* This function searches to see if the parameter is already in the url, if not, it calls a function to append the parameter to the end of the url
* It then redirects the page to the new url
*
* */
function addParameterIfNotFound_andRedirect(parameter_name_hoping_to_insert, parameter_value_hoping_to_insert){

    //Because some subject areas' abbreviations include an amprisand, we need to replace all those actual amprisands with their url equivalent
    // '&' ->'%26'
    parameter_value_hoping_to_insert = parameter_value_hoping_to_insert.replace(/&/g, '%26');

    let parameter_found_at_index = URLParametersContained_returnIndex(parameter_name_hoping_to_insert, parameter_value_hoping_to_insert);

    // Meaning, it was not found
    if (parameter_found_at_index === -1){

        let new_parameters = addURLParameter_returnNewParameters(parameter_name_hoping_to_insert, parameter_value_hoping_to_insert);
        let pathname = window.location.pathname;
        let origin = window.location.origin;

        let new_url = origin + pathname + '?' + new_parameters

        window.location.replace(new_url)
    }
}





/*
* This promise dynamically renders the subject areas from the /json/upload-categories.json file
* */
let renderSubjectAreasDynamically_Promise = new Promise(function (resolve, reject) {
    $.getJSON("/json/upload-categories.json", function(data, err){

        $.each(data, function (key, value) {

            let dropdownOuterCategoryAccordion = document.createElement('div');
            dropdownOuterCategoryAccordion.classList.add('accordion');
            dropdownOuterCategoryAccordion.classList.add('shop-bar-categories');

            let cardElement = document.createElement('div');
            cardElement.classList.add('card');
            dropdownOuterCategoryAccordion.append(cardElement);


            let cardHeaderElement = document.createElement('div');
            cardHeaderElement.classList.add('card-header')
            cardElement.append(cardHeaderElement);



            // This is because some of our categories have spaces, and we cannot have spaces as ID's
            let bodyIDSplit = key.split(' ');
            let bodyID = bodyIDSplit.join('_')

            let dropdownOuterCategoryLink = document.createElement('a');
            dropdownOuterCategoryLink.classList.add('dropdown-category')
            dropdownOuterCategoryLink.classList.add('subject-areas-dropdown-link')
            dropdownOuterCategoryLink.classList.add('mb-0')
            dropdownOuterCategoryLink.setAttribute('href', '#collapse' + bodyID)
            dropdownOuterCategoryLink.setAttribute('data-toggle', 'collapse')
            dropdownOuterCategoryLink.setAttribute('aria-expanded', 'false')
            dropdownOuterCategoryLink.setAttribute('aria-controls', 'collapse' + bodyID)
            dropdownOuterCategoryLink.innerHTML = key
            cardHeaderElement.append(dropdownOuterCategoryLink)


            let cardBodyElementWrapper = document.createElement('div');
            cardBodyElementWrapper.classList.add('collapse');

            cardBodyElementWrapper.setAttribute('id', 'collapse' + bodyID)
            cardBodyElementWrapper.setAttribute('data-parent', 'accordian') //This is a dummy attribute, but accordian doesnt seem to work without it
            cardElement.append(cardBodyElementWrapper)


            let cardBodyElement = document.createElement('div');
            cardBodyElement.classList.add('card-body');
            cardBodyElementWrapper.append(cardBodyElement)

            $.each(value, function(index, JSONcategory){

                let checkboxCategoryIDSplit = JSONcategory['category'].split(' ');
                let checkboxCategoryID = checkboxCategoryIDSplit.join('_')


                let categoryCheckbox = document.createElement('input');
                categoryCheckbox.setAttribute('type', 'checkbox');
                categoryCheckbox.classList.add('category-checkbox');
                categoryCheckbox.setAttribute('value', JSONcategory['category'])
                categoryCheckbox.setAttribute('id', 'checkbox' + checkboxCategoryID)

                let categoryLabelForCheckbox = document.createElement('label');
                categoryLabelForCheckbox.innerHTML = ' ' + JSONcategory['category'] // We add a space so its not smushed next to checkbox
                categoryLabelForCheckbox.setAttribute('for', 'checkbox' + checkboxCategoryID)

                let categoryBreak = document.createElement('br');

                cardBodyElement.append(categoryCheckbox)
                cardBodyElement.append(categoryLabelForCheckbox)
                cardBodyElement.append(categoryBreak)


            })

            $('#all-categories-dropdown').append(dropdownOuterCategoryAccordion)
            resolve()
        })
    })
})





/*
* This function expands the accordian of the checkbox already selected
* */
function expandParentAccordian(checkboxDiv){

    // Make sure that if a checkbox is checked, that it's accordian is dropped down

    //We have this try catch just in case an invalid subject area is passed into the url
    // The most common case is when subject=all is in the url, since 'all' is not a checkbox in our collapse div
    try {
        let parentCardDiv = checkboxDiv.closest('.card');
        let relativeCardHeaderDiv = parentCardDiv.find('.dropdown-category');
        relativeCardHeaderDiv[0].setAttribute('aria-expanded', 'true')


        //For some reason this 'closest' function returns an array with 1 element in it, our result
        let parentCollapseDiv = checkboxDiv.closest('.collapse');
        if (!parentCollapseDiv[0].classList.contains('show')){
            parentCollapseDiv[0].classList.add('show');
        }
    }catch (err) {
        console.log(err)
    }
}




/*
* This function automatically clicks on the checkbox's that a user previously clicked on by checking the url
* If the screen is not on a mobile device, then it will also expand the accordian so
* that a user sees which categories/subject areas they selected
* */
function checkCheckboxesFromURLQuery(){
    let url = window.location.href;
    let split_url = url.split('?')


    //First in array will be the actual origin and pathname
    if (split_url.length > 1){

        let url_parameters = split_url[1]
        let split_parameters = url_parameters.split('&');

        for (let i = 0 ; i < split_parameters.length ; i++){
            let parameterNameAndValue = split_parameters[i].split('=');

            let parameterName = parameterNameAndValue[0]
            if (parameterName === 'subject'){
                let parameterValue = parameterNameAndValue[1]

                // We do this because in the url, a '&' will be represented as '%26'. So we need to translate that back if it is in the string
                parameterValue = parameterValue.replace(/%26/g, '&');

                let checkboxSubjectIDJoinedByUnderscores = parameterValue.split('+').join('_')
                let checkMe = 'checkbox' + checkboxSubjectIDJoinedByUnderscores;
                let currCheckbox = $("[id='" + checkMe + "']")
                currCheckbox.prop( "checked", true );

                // If the width of the window is greater than 995 px, then expand the accordian
                // The reasoning is that on a mobile device, the already expanded accordians are annoying.
                // We turn into mobile mode when we read 991 px
                if ($(window).width() > 995){
                    expandParentAccordian(currCheckbox)
                }
            }

        }
    }

}





/*
* This function is a listener for any time a checkbox is checked/unchecked.
* Dynamically routing the page to a new page with the appended/removed parameter from clicking on the checkbox
* */
function reactToSubjectAreaCheckboxChange(){

    // We use this format, to incorporate delegated event handlers.
    // This is because when we first load the page, the dynamically rendered
    // categories do not have an event handler without .on()
    // (e.g. if we use $$('.category-checkbox').on('change') <- this wont work)
    $(document).on('change', '.category-checkbox', function () {

        // We join with a '+' because that will be translated as a space ' ' by the query parser
        let parameter_value = $(this).val().replace(/ /g, '+')
        if($(this).is(":checked")) {

            addParameterIfNotFound_andRedirect('subject', parameter_value)
        }else{

            removeParameterIfFound_andRedirect('subject', parameter_value)
        }
    })
}





$(document).ready(function(){



    renderSubjectAreasDynamically_Promise.then(function(){
        checkCheckboxesFromURLQuery();
    })


    reactToSubjectAreaCheckboxChange()

});