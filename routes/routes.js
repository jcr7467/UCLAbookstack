let express = require("express"),
    router  = express.Router();

const User = require('../models/user');
const Book = require('../models/book');


//////////////////////////////////////////////
// STATIC PAGES
// PAGES THAT DON'T HAVE POST REQUESTS
// ONLY RENDERING PAGE
router.get('/', (request, response) => {
    response.render('index', {
        title: "Home",
        navbar: "clear",
        layout: "home-layout"
    });
});

router.get('/uploadpics', (request, response) => {
    response.render('multiple_pics_guide', {
        title: 'Upload Multiple Pictures',
        navbar: 'default'
    })
});



router.get('/termsOfUse', (request, response) => {
    response.render('terms_and_conditions',{
        title: 'Terms and Conditions',
        navbar: 'default'
    });
});

router.get('/howitworks', (request, response) => {
    response.render('howitworks',{
        title:'How it works',
        navbar: 'clear'
    });
});

router.get('/howToFindISBN', (request, response) => {
    response.render('findISBN', {
        title: 'Find ISBN',
        navbar: 'default'
    });
});

router.get('/bookformtips',(request, response) => {
    response.render('bookformtips', {
        title: 'Book Form Tips',
        navbar: 'dark'
    });
});

router.get('/privacyPolicy', (request, response) => {
    response.render('privacy', {
        title: 'Privacy Policy',
        navbar: 'default'
    });
});



router.get('/contact', (request, response) => {
    response.render('contact', {
        title: 'Contact Us',
        navbar: 'clear'
    });
});



//////////////////////////////////////////////
// GET/POST PAGES
// PAGES THAT DON'T HAVE POST REQUESTS
//


router.get('/messages', (request, response, next) => {

    response.render('chat', {
        title: "Chat",
        navbar: "default"
    })

});




router.get('/search', (request,response, next) => {
    let { subject } = request.query,
        { pagenumber } = request.query,
        userSearchTerm = request.query.query;
    //userSearchTerm = 'tested'

    if (userSearchTerm === undefined){userSearchTerm = ''}

    userSearchTerm = userSearchTerm.toString();
    if (pagenumber === undefined){pagenumber = 1}
    if (subject === undefined){ subject = 'All'}

    pagenumber = parseInt(pagenumber);
    let nextpage = pagenumber + 1;
    let previouspage = pagenumber - 1;


    if (subject === 'All'){
        Book.paginate({
            title: {$regex: userSearchTerm, $options: 'i'}
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
                    navbar: 'default',
                    numOfBooks: numOfBooks
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
                    navbar: 'default',
                    numOfBooks: numOfBooks
                })
            }).catch((err) => {
            next(err);
        });
    }




});





router.get('/search/book', (request, response, next) => {

    let { id } = request.query;

    Book.findOne({_id : id}).lean().then((book) => {
        if(book == null){
            return next(new Error('An unknown error occurred'))
        }

        return Promise.all([book, User.findOne({_id: book.bookOwner}).lean().exec()]);

    }).then(([book, soldByThisUser]) => {

        return response.render('bookpage', {
            title: book.title,
            navbar: 'default',
            book: book,
            soldByThisUser: soldByThisUser,

        });
    }).catch((err) => {
        return next(err);
    });



});





module.exports = router;