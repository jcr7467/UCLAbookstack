let express = require("express"),
    router  = express.Router();


router.get('/', (request, response) => {
    response.render('index', {
        title: "Home",
        navbar: "clear"
    });
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

module.exports = router;