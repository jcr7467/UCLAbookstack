let express = require("express"),
    router  = express.Router();

const User = require('../models/user');
const Book = require('../models/book');

const async = require('async');

// For uploading pictures to AWS S3 for storage
const multer = require('multer'),
    AWS = require('aws-sdk');

let storage = multer.memoryStorage(),
    upload  = multer({storage: storage});

require('dotenv').config();

AWS.config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};


let s3 = new AWS.S3({});





router.get('/profile', (request, response, next) => {

    let currentUser = request.session.userId;

    User.findById(currentUser).lean()
    .then((user) => {
        return Promise.all([user, Book.find({bookOwner: currentUser}).lean()]);

    }).then(([user, books]) => {
        return response.render('partials/profile/myprofile', {
            title: 'Books',
            page: 'profile',
            navbar: 'default',
            bookCount: books.length,
            books: books,
            user: user
        });
    }).catch((err) => {
        next(err);
    })




/*

    //IMPORTANT: used lean() function to return books json object so that we can access in handlebars template
    Book.find({bookOwner: currentUser}).lean().then(books => {

        response.render('partials/profile/myprofile', {
            title: 'Books',
            page: 'profile',
            navbar: 'default',
            bookCount: 7,
            books: books

        });

    }).catch(err => {
        return next(err);
    });

 */




});







router.route('/profile/uploadbook')
    .get((request, response, next) => {


    let currentUser = request.session.userId;

    response.render('partials/profile/myprofile', {
        title: 'Upload Book',
        page: 'upload',
        navbar: 'default'
    });



    })
    .post(upload.array('images', 7), (request, response, next) => {

        let { files } = request;

        async.waterfall([
            function filetype(callback){
                let all_are_images = true;
                if (files.length > 0){
                    for (let i = 0 ; i < request.files.length ; i++){
                        let fileType = request.files[i].mimetype.split('/')[0];
                        if (fileType !== 'image'){
                            all_are_images = false;
                        }
                    }
                }

                if (!all_are_images){
                    return callback(new Error('All uploaded files must be images.'), null);
                }else{
                    return callback(null);
                }

            },
            function getDetails(callback){
                if (request.body.title && request.body.author && request.body.price && request.body.subject){

                    let picURLs = [];
                    let picKeys = [];

                    let amazonBucketURL = 'https://ucla-bookstack-uploaded-photos.s3-us-west-1.amazonaws.com/';


                    for (let i = 0 ; i < request.files.length ; i++){
                        let datetimestamp = Date.now(),
                            folderPrefix  = request.session.userId + '/',
                            nameOfFile    = request.files[i].fieldname + '-' + datetimestamp,
                            extension = '.' + request.files[i].originalname.split('.')[request.files[i].originalname.split('.').length - 1];

                        let key = folderPrefix + nameOfFile + extension;

                        picURLs.push(amazonBucketURL + key);
                        picKeys.push(key);


                        if (files.length > 0){
                            let receivingParams = {
                                Bucket: process.env.S3_BUCKET,
                                Key: key,
                                Body: request.files[i].buffer,
                                ACL: 'public-read'
                            }

                            s3.putObject(receivingParams, (err, data) => {
                                if (err){
                                    return next(err);
                                }
                            });
                        }


                    }

                    User.findById(request.session.userId, (err, user) => {
                        if (err){
                            return next(err);
                        }else{
                            let title = request.body.title;
                            let author = request.body.author;
                            //Creates 'book' object with the properties entered in form
                            let bookData = {
                                title: title,
                                bookAuthor: author,
                                isbn: request.body.isbn,
                                description: request.body.description,
                                price: request.body.price,
                                bookOwner: request.session.userId,
                                pictureURLs: picURLs,
                                pictureKeys: picKeys,
                                email: user.email,
                                subject: request.body.subject,
                                mainpic: picURLs[0]
                            };
                            callback(null, bookData);
                        }
                    });


                }else{

                    let err = new Error('Missing fields');
                    err.status = 400;
                    callback(err);
                }
            },
            function createBook(bookData, callback){

                //uses schema's 'create' method to insert document into Mongo
                Book.create(bookData, (error) => {
                    if (error) {return callback(error);}
                    return callback(null)
                });

            }
            ], function (err) {
            if (err){next(err);}
            return response.redirect('/profile');
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