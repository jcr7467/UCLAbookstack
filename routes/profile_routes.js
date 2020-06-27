let express = require("express"),
    router  = express.Router();

const User = require('../models/user');




router.get('/profile', (request, response, next) => {

    let currentUser = request.session.userId;

    response.render('partials/profile/myprofile', {
        title: 'Books',
        page: 'profile',
        navbar: 'default',
        bookCount: 0

    });


});



router.get('/profile/uploadbook', (request, response, next) => {


    let currentUser = request.session.userId;

    response.render('partials/profile/myprofile', {
        title: 'Upload Book',
        page: 'upload',
        navbar: 'default'

    });



});



router.get('/profile/settings', (request, response, next) => {


    let currentUser = request.session.userId;

    response.render('partials/profile/myprofile', {
        title: 'Settings',
        page: 'settings',
        navbar: 'default'

    });

});


module.exports = router;