let express = require("express"),
    router  = express.Router();

const User = require('../models/user');
const Book = require('../models/book');
const mid = require('../middleware/middleware');


//////////////////////////////////////////////
// STATIC PAGES
// PAGES THAT DON'T HAVE POST REQUESTS
// ONLY RENDERING PAGE


//Renders the home page
router.get('/', (request, response) => {

    response.render('index', {
        title: "Home",
        layout: "home-layout",
        css_for_this_page: "pages/bookstack-home-page.min.css"
    });
});


// Renders informational page which displays how to upload multiple pictures on BookStack
router.get('/uploadpics', (request, response) => {
    response.render('multiple_pics_guide', {
        title: 'Upload Multiple Pictures',
        css_for_this_page: 'pages/general-css.min.css'
    });
});


// Renders informational terms of use page
router.get('/termsofuse', (request, response) => {
    response.render('terms_and_conditions',{
        title: 'Terms and Conditions',
        css_for_this_page: 'pages/general-css.min.css'
    });
});


// Renders how it works page, just a description of what BookStack is
// Currently, we are not using this page, but is here for reference in case of future use
router.get('/howitworks', (request, response) => {
    response.render('howitworks',{
        title:'How it works'
    });
});


// Renders informational page showing users what a isbn number is and how to generally find it
router.get('/howToFindISBN', (request, response) => {
    response.render('findISBN', {
        title: 'Find ISBN',
        css_for_this_page: 'pages/general-css.min.css'
    });
});


// Renders informational page giving general tips for uploading a book/item
// Would ideally start speaking more about other items you can post, not just books
router.get('/bookformtips',(request, response) => {
    response.render('bookformtips', {
        title: 'Book Form Tips',
        css_for_this_page: 'pages/general-css.min.css'
    });
});


// Renders informational page of the privacy policy
router.get('/privacyPolicy', (request, response) => {
    response.render('privacy', {
        title: 'Privacy Policy',
        css_for_this_page: 'pages/general-css.min.css'
    });
});

// Renders informational page of an email where we can be reached
router.get('/contact', (request, response) => {
    response.render('contact', {
        title: 'Contact Us',
        css_for_this_page: 'pages/general-css.min.css'
    });
});

router.get('/heicimages', (request, response, next) => {
    response.render('heic_issues', {
        title: 'HEIC Images',
        css_for_this_page: 'pages/general-css.min.css'
    })
})



//////////////////////////////////////////////
// GET/POST PAGES
// PAGES THAT DON'T HAVE POST REQUESTS
//














router.get('/search/book', mid.requiresLogin, (request, response, next) => {

    let { id } = request.query;


    Book.findOne({_id : id}).lean().then((book) => {

        if(book === null){
            return next(new Error('An unknown error occurred'))
        }

        return Promise.all([book, User.findOne({_id: book.bookOwner}).lean().exec()]);

    }).then(([book, soldByThisUser]) => {

        return response.render('bookpage', {
            title: book.title,
            navbar: 'default',
            book: book,
            soldByThisUser: soldByThisUser,
            monthAdded: book.dateAdded.getMonth(),
            dayOfMonthAdded: book.dateAdded.getDate(),
            yearAdded: book.dateAdded.getFullYear(),
            css_for_this_page: "pages/post-page.min.css"

        });
    }).catch((err) => {
        return next(err);
    });



});




// TODO: Find why it returns nil
router.get('/search/:pagenumber', (request,response, next) => {

    let { subject } = request.query,
        userSearchTerm = request.query.query;
    let { pagenumber } = request.params;
    pagenumber = parseInt(pagenumber);
    let itemOnPageLimit = request.query.limit;
    if (itemOnPageLimit === undefined){itemOnPageLimit = '12'}


    if (itemOnPageLimit !== '12' && itemOnPageLimit !== '32' && itemOnPageLimit !== '80'){
        let limitError = new Error('Ineligable limit');
        limitError.status = 403
        next(limitError);
    }

    // Parse to RegEx
    userSearchTerm = userSearchTerm.toString();
    splitUserSearchTerm = userSearchTerm.split(' ');
    regexSearchTerm = ""
    let i;
    for(i = 0; i < splitUserSearchTerm.length; i++) {
        // Unsure how double spaces affect
        if(splitUserSearchTerm[i] == "") {
            continue;
        }
        regexSearchTerm += "\\b" + splitUserSearchTerm[i] + "\\b";
        if(i+1 < splitUserSearchTerm.length) {
            regexSearchTerm += "|";
        }
    }


    if (pagenumber === undefined){pagenumber = 1}
    if (subject === undefined){ subject = 'All'}


    let nextpage = pagenumber + 1;
    let previouspage = pagenumber - 1;



    if (subject === 'All'){

        Book.paginate({
            title: {$regex: regexSearchTerm, $options: 'i'}
        }, {lean: true, page:pagenumber, limit: itemOnPageLimit})
            .then((books) => {
                // If the length/amount of books on this page is zero, and the pagenumber
                // is not the first page, redirect to the first page
                // I.e. if an invalid page number is passed in, then just redirect the user to the first page
                if (books.docs.length === 0 && pagenumber != 1){

                    let redirectURL = '/search/' + books.totalPages.toString() + '?query=' + userSearchTerm + '&subject=' + subject.toString()

                    return response.redirect(redirectURL)
                }

                let numOfBooks = books.totalDocs,
                    lowerRange = (pagenumber - 1) * itemOnPageLimit + 1,
                    upperRange = (pagenumber) * itemOnPageLimit - (books.limit - books.docs.length);
                //^  Subtracts any pages that are missing to render the correct last item  ^



                response.render('search_for_books', {
                    array: books.docs,
                    subject: subject,
                    searchedTerm: userSearchTerm,
                    title: userSearchTerm,
                    currentPageNumber:pagenumber,
                    numberOfPages: books.totalPages,
                    previouspage: previouspage,
                    nextpage:nextpage,
                    numOfBooks: numOfBooks,
                    lowerRange: lowerRange,
                    upperRange: upperRange,
                    hasNextPage: books.hasNextPage,
                    hasPrevPage: books.hasPrevPage,
                    itemOnPageLimit: itemOnPageLimit,
                    css_for_this_page: "pages/search-page.min.css"
                })
            }).catch((err) => {
            next(err);
        });
    }else{
        Book.paginate({
            title: {$regex: regexSearchTerm, $options: 'i'}, // We use regex to match the search term anywhere in the title
            subject: {$in: subject} // Our 'subject' is an array of subjects, so any subject that is in this subject array
        }, {lean: true, page:pagenumber, limit:itemOnPageLimit})
            .then((books) => {

                let numOfBooks = books.docs.length,
                    lowerRange = (pagenumber - 1) * itemOnPageLimit + 1,
                    upperRange = (pagenumber) * itemOnPageLimit - (books.limit - books.docs.length);

                response.render('search_for_books', {
                    array: books.docs, // array of the actual books. books.docs refers to the actual books
                    subject: subject, // This is also an array of subjects
                    searchedTerm: userSearchTerm,
                    title: userSearchTerm,
                    currentPagenumber:books.page,
                    numberofPages:books.totalPages,
                    previouspage: previouspage,
                    nextpage:nextpage,
                    numOfBooks: numOfBooks,
                    lowerRange: lowerRange,
                    upperRange: upperRange,
                    css_for_this_page: "pages/search-page.min.css"
                })
            }).catch((err) => {
            next(err);
        });
    }
});

/**
 * Admin Page
 */
router.get('/admintest', mid.adminOnly, mid.requiresLogin,(request, response, next) => {
    response.render('adminpage', {
        title: "Adminpage",
        layout: "admin-layout"
    })
})

// These two routes are simply used to create an error if they are ever reached.
// These routes would only be encoountered if an incompatible file type is passed into our upload book form
// We also check for file type on the backend, but these routes are quickly accessed on the front end without
// taking the time to first upload the image. Hopefully protecting our server
router.get('/invalidheic', (request, response, next) => {
    let err = new Error("These are HEIC images! Check out our guide on how to fix this issue");
    err.status = 400
    next(err);
})

router.get('/invalidfiletype', (request, response, next) => {
    let err = new Error("Invalid file type detected");
    err.status = 400
    next(err);
})









module.exports = router;