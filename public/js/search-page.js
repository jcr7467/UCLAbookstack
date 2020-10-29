
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
            cardHeaderElement.classList.add('card-header');
            cardElement.append(cardHeaderElement);


            // This is because some of our categories have spaces, and we cannot have spaces as ID's
            let bodyID = key.split(' ').join('_');

            let dropdownOuterCategoryLink = document.createElement('a');
            $(dropdownOuterCategoryLink).addClass('dropdown-category');
            $(dropdownOuterCategoryLink).addClass('subject-areas-dropdown-link');
            dropdownOuterCategoryLink.setAttribute('href', '#collapse' + bodyID);
            dropdownOuterCategoryLink.setAttribute('data-toggle', 'collapse');
            dropdownOuterCategoryLink.setAttribute('aria-expanded', 'false');
            dropdownOuterCategoryLink.setAttribute('aria-controls', 'collapse' + bodyID);
            dropdownOuterCategoryLink.innerHTML = key + "<i></i>";
            cardHeaderElement.append(dropdownOuterCategoryLink);


            let cardBodyElementWrapper = document.createElement('div');
            $(cardBodyElementWrapper).addClass('collapse');
            $(cardBodyElementWrapper).addClass('bookFilterCategories');
            cardBodyElementWrapper.setAttribute('id', 'collapse' + bodyID);
            cardBodyElementWrapper.setAttribute('data-parent', 'accordian'); //This is a dummy attribute, but accordian doesnt seem to work without it
            cardElement.append(cardBodyElementWrapper);


            let cardBodyElement = document.createElement('div');
            cardBodyElement.classList.add('card-body');
            cardBodyElementWrapper.append(cardBodyElement);

            let categoryAllCheckbox = document.createElement('input');
            categoryAllCheckbox.setAttribute('type', 'checkbox');
            $(categoryAllCheckbox).addClass('category-all-checkbox');
            categoryAllCheckbox.setAttribute('value', key);
            categoryAllCheckbox.setAttribute('id', 'allcheckbox' + bodyID);

            let categoryLabelForAllCheckbox = document.createElement('label');
            categoryLabelForAllCheckbox.innerHTML = 'All';
            categoryLabelForAllCheckbox.setAttribute('for', 'allcheckbox' + bodyID);

            let categoryContainerDiv = document.createElement('div');
            $(categoryContainerDiv).addClass('categoryContainerDiv');

            categoryContainerDiv.append(categoryAllCheckbox);
            categoryContainerDiv.append(categoryLabelForAllCheckbox);
            cardBodyElement.append(categoryContainerDiv);

            $.each(value, function(index, JSONcategory){

                let checkboxCategoryID = JSONcategory['category'].split(' ').join('_')

                let categoryCheckbox = document.createElement('input');
                categoryCheckbox.setAttribute('type', 'checkbox');
                $(categoryCheckbox).addClass('category-checkbox');
                categoryCheckbox.setAttribute('value', JSONcategory['category']);
                categoryCheckbox.setAttribute('id', 'checkbox' + checkboxCategoryID);

                let categoryLabelForCheckbox = document.createElement('label');
                categoryLabelForCheckbox.innerHTML = JSONcategory['category'];
                categoryLabelForCheckbox.setAttribute('for', 'checkbox' + checkboxCategoryID);

                let categoryContainerDiv = document.createElement('div');
                $(categoryContainerDiv).addClass('categoryContainerDiv');
                categoryContainerDiv.append(categoryCheckbox);
                categoryContainerDiv.append(categoryLabelForCheckbox);
                cardBodyElement.append(categoryContainerDiv);
            });

            $('#all-categories-dropdown').append(dropdownOuterCategoryAccordion);
            resolve();
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
        relativeCardHeaderDiv[0].setAttribute('aria-expanded', 'true');


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
    let split_url = url.split('?');


    //First in array will be the actual origin and pathname
    if (split_url.length > 1) {

        let url_parameters = split_url[1];
        let split_parameters = url_parameters.split('&');

        for (let i = 0 ; i < split_parameters.length ; i++){
            let parameterNameAndValue = split_parameters[i].split('=');

            let parameterName = parameterNameAndValue[0];
            if (parameterName === 'subject'){
                let parameterValue = parameterNameAndValue[1];

                // We do this because in the url, a '&' will be represented as '%26'. So we need to translate that back if it is in the string
                parameterValue = parameterValue.replace(/%26/g, '&');

                let checkboxSubjectIDJoinedByUnderscores = parameterValue.split('+').join('_');
                let checkMe = 'checkbox' + checkboxSubjectIDJoinedByUnderscores;
                let currCheckbox = $("[id='" + checkMe + "']");
                currCheckbox.prop( "checked", true );

                // If the width of the window is greater than 995 px, then expand the accordian
                // The reasoning is that on a mobile device, the already expanded accordians are annoying.
                // We turn into mobile mode when we read 991 px
                if ($(window).width() > 995){
                    expandParentAccordian(currCheckbox);
                }
            }

        }

        // Check each all checkbox that has every checkbox in the same subject also checked
        $('.category-all-checkbox').each(function() {
            let allCategoryiesChecked = true;

            $(this).parent().parent().find('.category-checkbox').each(function() {
                if (allCategoryiesChecked !== $(this).prop('checked')) {
                    allCategoryiesChecked = false;
                    return false;
                }
            });

            $(this).prop('checked', allCategoryiesChecked);

        });
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


    // Uncheck category-all-checkbox if any of the checkboxes in its same category are unchecked
    $(document).on('change', '.category-checkbox', function () {
        if(!$(this).is(":checked")) {
            $(this).parent().parent().find('.category-all-checkbox').prop('checked', false);
        }
    });



    // When the check value of the 'All' checkbox is changed,
    // set all check boxes in the same category the its equivalent check value
    $(document).on('change', '.category-all-checkbox', function () {
        $(this).parent().parent().find('.category-checkbox').prop('checked', $(this).is(":checked"));
    });



    // Loop through and append the values of all checked check boxes to the url as a query
    // when the submit button is pressed.
    $('#submitShopBarCategories').click(function() {
        let location   = window.location.origin;   // Returns base URL (https://example.com)
        let pathname = window.location.pathname; // Returns path only (/path/example.html)
        let queryName = '?query=';
        let new_url = location + pathname + queryName;
        $('.shop-bar-categories').find('.category-checkbox:checked').each(function() {
            let parameter_value = $(this).val().replace(/ /g, '+').replace(/&/g, '%26');

            new_url += '&' + 'subject' + '=' + parameter_value;
        });
        window.location.replace(new_url);
    });



    //Reset the url to its default value without any subject area filters checked
    $('#resetShopBarCategories').click(function() {
        let new_url = window.location.origin + window.location.pathname + '?query=';
        window.location.replace(new_url);
    });
}





$(document).ready(function(){

    renderSubjectAreasDynamically_Promise.then(function(){
        checkCheckboxesFromURLQuery();
    })

    reactToSubjectAreaCheckboxChange();

});