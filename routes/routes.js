let express = require("express"),
    router  = express.Router();

const User = require('../models/user');


//////////////////////////////////////////////
// STATIC PAGES
// PAGES THAT DON'T HAVE POST REQUESTS
// ONLY RENDERING PAGE
router.get('/', (request, response) => {
    response.render('index', {
        title: "Home",
        navbar: "clear"
    });
});

router.get('/uploadpics', (request, response) => {
    response.render('multiple_pics_guide', {
        title: 'Upload Multiple Pictures',
        navbar: 'default'
    })
});

router.get('/chat', (request, response) => {
    response.render('chat', {
        title: "Chat",
        navbar: "dark"
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









module.exports = router;