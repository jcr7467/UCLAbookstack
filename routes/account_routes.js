let express = require("express"),
    router  = express.Router();

const User = require('../models/user');

let crypto = require('crypto');

const mid = require('../middleware/middleware');

let bcryptjs = require('bcryptjs');

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
    .get(mid.ifLoggedIn, (request, response, next) => {
        response.render('partials/signinout/signin', {
            title: 'Sign In',
            layout: 'home-layout.hbs'
        });
    })
    .post((request, response, next) => {
        if (request.body.email && request.body.password){
            User.authenticate(request.body.email, request.body.password, (err, user) => {
                if (err || !user){
                    request.flash('error', 'Incorrect email/password');
                    return response.redirect('/signin');
                }else{
                    request.session.userId = user._id;
                    request.session.admin_level = user.admin_level;
                    request.session.userObject = user;
                    return response.redirect('/profile');
                }
            });
        }else{
            let err = new Error("Both fields are required");
            err.status = 401;
            return next(err);
        }
});



router.route('/signup')
    .get(mid.ifLoggedIn, (request, response, next) => {
        let error = null
        if (request.query.valid) error = "Email is already taken"
        response.render('partials/signinout/signup', {
            title: 'Sign Up',
            layout: 'home-layout.hbs',
            error
        });
    })
    .post((request, response, next) => {

        if (request.body.formfilt){
            // This will hopefully filter bots out,
            // users will not see formfilt section, only robots will
            response.redirect('/');

        }else{

            if (request.body.email &&
                request.body.password &&
                request.body.firstname &&
                request.body.lastname){


                /*We only want users with UCLA emails to be able to make an account, so no one can troll and spam our website*/
                if (!(request.body.email.endsWith("@ucla.edu") || request.body.email.endsWith("@g.ucla.edu"))){
                    let err = new Error("Please use your UCLA email (:")
                    return next(err);
                }


                //Creates Javascript object with form input data
                let userData = {
                    email: request.body.email,
                    firstname: request.body.firstname,
                    lastname: request.body.lastname,
                    password: request.body.password
                }

                //Uses schema's 'create' method to insert document into Mongo
                User.create(userData, (error, user) => {
                    if (error) { 
                        var string = encodeURIComponent('email taken');
                        return response.redirect('/signup?valid=' + string);
                    }
                    request.session.userId = user._id; // By setting this, we are "logging" them in
                    request.session.admin_level = user.admin_level
                    request.session.userObject = user;
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
    .get(mid.ifLoggedIn, (request, response, next) => {
        response.render('partials/signinout/forgot_password.hbs', {
            title: 'Forgot password'
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

                let case_insensitive_email = new RegExp('\\b' + request.body.email + '\\b', 'i');
                User.findOne({email: case_insensitive_email}, function (err, user) {
                    if (!user) {
                        let err = new Error('No account with that email exists in our records(email is case-sensitive)');
                        err.status = 401;
                        return callback(err, null);
                    }
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.resetPasswordTokenValid = true;
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
                    text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + request.headers.host + '/reset?token=' + token + '\n\n' +
                        'Note: This link will expire in 1 hour.\n\n' +
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
            }else{
                request.flash('success', 'Password Reset Email successfully sent')
                return response.redirect('/');
            }

        });
    });


router.route('/reset')
    .get((request, response, next) => {

        let { token } = request.query;

        User.findOne({
            resetPasswordToken:token,
            resetPasswordExpires: {$gt : Date.now()},
            resetPasswordTokenValid: true},
            (error, user) => {

            if (!user){
                let err = new Error('The time limit of 1 hour has passed or an invalid url has been entered');
                err.status = 401;
                return next(err);
            }else{
                response.render('partials/signinout/resetpassword', {
                    token: token,
                    url: request.originalUrl,
                    title: 'Reset'
                });
            }
        });
    })
    .post((request, response, next) => {



        async.waterfall([
            function checkToken(callback) {
                User.findOne({
                    resetPasswordToken: request.body.token,
                    resetPasswordExpires: {$gt: Date.now()}
                }, function (err, user) {
                    if (!user) {
                        let err = new Error('Password reset token is invalid or has expired.');
                        err.status = 401;
                        return callback(err, null);
                    }
                    return callback(null, user);
                });
            },
            function updatePassword(user, callback){
                if (request.body.password === request.body.confirmpassword) {
                    console.log(request.body.password, "pass")

                    User.findOne({resetPasswordToken: request.body.token}).then((user) => {
                        user.password = request.body.password;
                        user.save()

                        return callback(null, user)
                    });

                } else {
                    let err = new Error('Passwords do not match');
                    err.status = 401;
                    return callback(err, null);
                }
            },
            function sendEmailConfirmation(user, callback) {
                let mailOptions = {
                    from: 'BookStack <teambookstackuclaucla@gmail.com>',
                    to: user.email,
                    subject: 'Your password has been changed',
                    text: 'Hey ' + user.firstname + ', \n\n' +
                        'This is a confirmation that the password for your account(' + user.email + ') has just been changed.\n'
                };

                transporter.sendMail(mailOptions, function (err) {
                    if(err){return callback(err, null)}
                    return callback(null);
                });
            }
        ], function (err) {
            if(err){request.flash('error', err.message + ' Error code: ' + err.status); return response.redirect(request.body.url)}
            request.flash('success', 'Successfully updated password');
            return response.redirect('/signin');
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










router.get('/verify/sendemail',(request, response, next) => {
    User.findById(request.session.userId)
        .exec((error, user) => {
            if (error) {
                return next(error)

            } else {
                crypto.randomBytes(20, function (err, buf) {
                    let token = buf.toString('hex');



                    let mailOptions = {
                        from: 'BookStack <teambookstackucla@gmail.com>',
                        to: user.email,
                        subject: 'Email Confirmation',
                        text: 'Hey ' + user.firstname + '\n\n' +
                            'Please click the following link to confirm your email address:\n\n' +
                            'http://' + request.headers.host + '/verify/verifyemail?token=' + token +
                            '&salt=' + request.session.userId
                    };

                    transporter.sendMail(mailOptions, function (err) {
                        if (err) {
                            return next(err);
                        }
                        user.verifyEmailToken = token
                        user.save()

                        request.flash('success', 'Verification email successfully sent');
                        return response.redirect('/profile/uploadbook')
                    });

                });
            }
        });
});

//
// This one is implemented differently from when we make a token to reset a password
// In this one, we don't care about a 1 hour limit for the link to expire,
// We just care about making sure this is indeed them
// Every time a user clicks the verify email button, the token they had before is overwritten
// I.e. Only one email will ever be valid at a time
//
router.get('/verify/verifyemail',(request, response, next) => {
    let {token} = request.query; // This is actually a generated token
    let {salt} = request.query; // This is going to be the user's ID (deception)

    User.findOne({_id: salt, verifyEmailToken: token}, (err, user) => {
        if (err){next(err)}

        user.emailverified = true
        user.save()

        request.session.userId = user._id; // By setting this, we are "logging" them in
        request.session.admin_level = user.admin_level
        request.session.userObject = user;
        request.flash('success', 'Thank you for confirming your email!');
        return response.redirect('/profile/uploadbook');
    });
});





module.exports = router;