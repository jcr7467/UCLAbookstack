let express = require("express"),
    router  = express.Router();

const User = require('../models/user');

let crypto = require('crypto');

//OUR GMAIL SERVICE ONLY ALLOWS 500 EMAILS A DAY AS OF 06/20/20
//with more users, we will have to change this
let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'teambookstackucla@gmail.com',
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: process.env.GMAIL_ACCESS_TOKEN
    }
});
let async = require('async')


router.route('/signin')
    .get((request, response) => {
        response.render('partials/signinout/signin', {
            title: 'Sign In',
            layout: 'signinout_layout.hbs'
        });
    })
    .post((request, response, next) => {
        if (request.body.email && request.body.password){
            User.authenticate(request.body.email, request.body.password, (err, user) => {
                if (err || !user){
                    return response.redirect('/signin');
                }else{
                    request.session.userId = user._id;
                    request.session.admin_level = user.admin_level
                    return response.redirect('/');
                }
            });
        }else{
            let err = new Error("Both fields are required");
            err.status = 401;
            return next(err);
        }
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







router.route('/forgot')
    .get((request, response) => {
        response.render('partials/signinout/forgot_password.hbs', {
            title: 'Forgot password',
            layout: 'signinout_layout.hbs'
        });
    })
    .post((request, response, next) => {




        async.waterfall([
            function createToken(callback) {
                crypto.randomBytes(20, function (err, buf) {
                    let token = buf.toString('hex');
                    return callback(null, token);
                });
            },
            function verifyEmailExists(token, callback) {

                console.log(request.body.email);


                let case_insensitive_email = new RegExp('\\b' + request.body.email + '\\b', 'i');


                User.findOne({email: case_insensitive_email}, function (err, user) {
                    if (!user) {
                        let err = new Error('No account with that email exists in our records(email is case-sensitive)');
                        err.status = 401;
                        return callback(err, null);
                    }
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.save(function (err) {
                        if(err){return callback(err, null)}
                        return callback(null, token, user);
                    });

                });
            },
            function sendResetEmail(token, user, callback) {
                let mailOptions = {
                    from: 'BookStack <teambookstackucla@gmail.com>',
                    to: user.email,
                    subject: 'BookStack Reset Password',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + request.headers.host + '/reset?token=' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                transporter.sendMail(mailOptions, function (err) {
                    if(err){return callback(err, null)}
                    return callback(null);
                });
            }

        ], function (err) {
            if (err) {
                return next(err);
            }
        });

    });








router.get('/signout', (request, response, next) => {
    if (request.session) {
        // Deletes session object that is required to login
        request.session.destroy((err) => {
            if (err) {return next(err);}
        });
    }
    return response.redirect('/');
});


module.exports = router;