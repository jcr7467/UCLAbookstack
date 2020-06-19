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



//////////////////////////////////////////////
// GET/POST PAGES
// PAGES THAT DON'T HAVE POST REQUESTS
//


router.route('/signin').get((request, response) => {
    response.render('partials/signinout/signin', {
        title: 'Sign In',
        layout: 'signinout_layout.hbs'
    });
});

router.route('/signup')
    .get((request, response) => {
        response.render('partials/signinout/signup', {
            title: 'Sign Up',
            layout: 'signinout_layout.hbs'
        });
    })
    .post((request, response) => {

        if (request.body.formfilt){
            // This will hopefully filter bots out,
            // users will not see formfilt section, only robots will
            response.redirect('/');

        }else{

            if (request.body.email &&
                request.body.password &&
                request.body.name){


                //Creates Javascript object with form input data
                let userData = {
                    email: request.body.email,
                    name: request.body.name,
                    password: request.body.password
                }

                //Uses schema's 'create' method to insert document into Mongo
                User.create(userData, (error, user) => {
                    if (error){ return next(error);}
                    request.session.userId = user._id; // By setting this, we are "logging" them in
                    request.session.admin_level = user.admin_level
                    return response.redirect('/');
                });

            }else{
                let err = new Error('All fields required');
                err.status = 400;
                return next(err);
            }
        }
});




router.get('/signout', (request, response, next) => {
    if (request.session) {
        // Deletes session object that is required to login
        request.session.destroy((err) => {
            if (err) {return next(err);}
            return response.redirect('/');
        });
    }
});


module.exports = router;