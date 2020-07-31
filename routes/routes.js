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
    console.log('supss')
    response.render('index', {
        title: "Home",
        layout: "home-layout"
    });
});


// Renders informational page which displays how to upload multiple pictures on BookStack
router.get('/uploadpics', (request, response) => {
    response.render('multiple_pics_guide', {
        title: 'Upload Multiple Pictures'
    })
});


// Renders informational terms of use page
router.get('/termsOfUse', (request, response) => {
    response.render('terms_and_conditions',{
        title: 'Terms and Conditions'
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
        title: 'Find ISBN'
    });
});


// Renders informational page giving general tips for uploading a book/item
// Would ideally start speaking more about other items you can post, not just books
router.get('/bookformtips',(request, response) => {
    response.render('bookformtips', {
        title: 'Book Form Tips'
    });
});


// Renders informational page of the privacy policy
router.get('/privacyPolicy', (request, response) => {
    response.render('privacy', {
        title: 'Privacy Policy'
    });
});




// Renders informational page of an email where we can be reached
router.get('/contact', (request, response) => {
    response.render('contact', {
        title: 'Contact Us'
    });
});



//////////////////////////////////////////////
// GET/POST PAGES
// PAGES THAT DON'T HAVE POST REQUESTS
//














router.get('/search/book', mid.requiresLogin, (request, response, next) => {
    console.log('heynowheynow')
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
            yearAdded: book.dateAdded.getFullYear()

        });
    }).catch((err) => {
        return next(err);
    });



});





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

    userSearchTerm = userSearchTerm.toString();
    console.log(userSearchTerm)






    if (pagenumber === undefined){pagenumber = 1}
    if (subject === undefined){ subject = 'All'}


    let nextpage = pagenumber + 1;
    let previouspage = pagenumber - 1;



    if (subject === 'All'){

        Book.paginate({
            title: {$regex: userSearchTerm, $options: 'i'}
        }, {lean: true, page:pagenumber, limit: itemOnPageLimit})
            .then((books) => {
                if (books.docs.length === 0){
                    let redirectURL = '/search/' + books.totalPages.toString() + '?query=' + userSearchTerm + '&subject=' + subject.toString()

                    return response.redirect(redirectURL)
                }

                let numOfBooks = books.totalDocs;
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
                    itemOnPageLimit: itemOnPageLimit
                })
            }).catch((err) => {
            next(err);
        });
    }else{
        Book.paginate({
            title: {$regex: userSearchTerm, $options: 'i'},
            subject: subject
        }, {lean: true, page:pagenumber, limit:15})
            .then((books) => {

                let numOfBooks = books.docs.length

                response.render('search_for_books', {
                    array: books.docs,
                    subject: subject,
                    searchedTerm: userSearchTerm,
                    title: userSearchTerm,
                    currentPagenumber:books.page,
                    numberofPages:books.totalPages,
                    previouspage: previouspage,
                    nextpage:nextpage,
                    numOfBooks: numOfBooks
                })
            }).catch((err) => {
            next(err);
        });
    }




});


module.exports = router;