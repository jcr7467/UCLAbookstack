let express = require("express"),
    router  = express.Router();

const User = require('../models/user');
const Book = require('../models/book');

const mid = require('../middleware/middleware');

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





router.get('/profile',mid.requiresLogin, (request, response, next) => {

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







router.route('/profile/uploadbook', mid.requiresLogin)
    .get((request, response, next) => {


    let currentUser = request.session.userId;

    response.render('partials/profile/myprofile', {
        title: 'Upload Book',
        page: 'upload',
        navbar: 'default'
    });



    })
    .post(upload.array('images', 7), (request, response, next) => {
        let {files} = request;
        let file_entries = request.files.length;



        async.waterfall([
            function fileType(callback){
                let allImages = true;
                if(file_entries > 0) {

                    for (let i = 0; i < file_entries; i++) {

                        let fileType = request.files[i].mimetype.split('/')[0];
                        // console.log(fileType)
                        if (fileType !== 'image') {
                            allImages = false;

                        }

                        let picextension = '.' + request.files[i].originalname.split('.')[request.files[i].originalname.split('.').length - 1];

                        if (picextension.toLowerCase() === ".heic"){

                        }

                    }
                }


                if(allImages === false){
                    return callback(new Error('All uploaded files must be images'), null);
                }else{
                    return callback(null);
                }

            },
            function getDetails(callback) {
                if (request.body.title && request.body.author && request.body.price && request.body.subject){


                    //Then makes an object and stores it in the mongoDB database
                    //////////////////////////////////////////////////////
                    let picURLs = [];
                    let picKeys = [];


                    let amazonBucket = process.env.S3_URL_PREFIX_FOR_RETRIEVAL;
                    let amazonHEICBucket = process.env.S3_URL_PREFIX_FOR_RETRIEVAL_HEIC;
                    for( let i = 0 ; i < file_entries; i++){
                        let datetimestamp = Date.now(),
                            folderPrefix = request.session.userId + '/',
                            nameOfFile = request.files[i].fieldname + '-' + datetimestamp;
                            picextension = '.' + request.files[i].originalname.split('.')[request.files[i].originalname.split('.').length - 1];



                        let key = folderPrefix + nameOfFile + picextension;

                        picURLs.push(amazonBucket + key);   // Makes an array of all the photo-storage-location references
                        picKeys.push(key);


                        if(file_entries > 0) {
                            let receivingparams = {
                                Bucket: process.env.S3_BUCKET,
                                Key: key,
                                Body: request.files[i].buffer,
                                ACL: 'public-read'
                            };

                            s3.putObject(receivingparams, function (err, data) {
                                if (err) {
                                    return next(err)
                                }
                            });
                        }


                    }

                    User.findById(request.session.userId, (error, user) => {
                        if (error) {
                            callback(error);
                        }
                        else {

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
                                mainpicURL: picURLs[0]
                            };
                            callback(null, bookData)
                        }
                    });
                }else {
                    let err = new Error('Missing fields');
                    err.status = 400;
                    callback(err);
                }
            },
            function createBook(bookData, callback){
                //uses schema's 'create' method to insert document into Mongo

                Book.create(bookData, (error) => {
                    if (error) {return callback(error);}else{
                        return callback(null);

                    }

                });

            }
        ], function(err) {
            if(err){return next(err)}

            return response.redirect('/profile');
        });
    });










router.get('/profile/settings', mid.requiresLogin, (request, response, next) => {


    let currentUser = request.session.userId;

    response.render('partials/profile/myprofile', {
        title: 'Settings',
        page: 'settings',
        navbar: 'default'

    });

});

router.post('/profile/settings', mid.requiresLogin, (request, response, next) => {
    let { firstname } = request.body,
        { lastname } = request.body,
        { email } = request.body;


    User.findOne({_id: request.session.userId})
        .then(user=> {
            user.firstname = firstname;
            user.lastname  = lastname;
            user.email     = email;
            user.save();
            request.session.userObject = user;
        })
        .then(() => {
            response.redirect('/profile')
        })
        .catch(err => {
            next(err);
        })





});


module.exports = router;

