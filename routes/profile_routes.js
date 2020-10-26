let express = require("express"),
    router  = express.Router();
const User = require('../models/user');
const Book = require('../models/book');
const mid = require('../middleware/middleware');
const async = require('async');
const convert = require('heic-convert');


// For uploading pictures to AWS S3 for storage
const multer = require('multer'),
    AWS = require('aws-sdk');


let storage = multer.memoryStorage(),
    upload  = multer({storage: storage});


require('dotenv').config();

/* Convert the image Like a boss */
async function heicToJpeg(inputBuffer) {
    const outputBuffer = await convert({
        buffer: inputBuffer, // the HEIC file buffer
        format: 'JPEG', // output format
        quality: 1
    });
    return outputBuffer;
}

AWS.config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};


let s3 = new AWS.S3({});


router.get('/profile',mid.requiresLogin, (request, response, next) => {

    let { pagenumber } = request.query;
    let itemOnPageLimit = 5;
    if (pagenumber === undefined){
        pagenumber = 1
    }
    let nextpage = parseInt(pagenumber) + 1;
    let previouspage = parseInt(pagenumber) - 1;

    let currentUser = request.session.userId;


    Book.paginate({bookOwner: currentUser}, {lean: true, page:pagenumber, limit: itemOnPageLimit})
        .then((books) => {



            let numOfBooks = books.totalDocs;
            lowerRange = (pagenumber - 1) * itemOnPageLimit + 1,
            upperRange = (pagenumber) * itemOnPageLimit - (books.limit - books.docs.length);
            //^  Subtracts any pages that are missing to render the correct last item  ^





            return response.render('partials/profile/myprofile', {
                books: books.docs,
                page: 'profile',
                title: 'Books',
                currentPageNumber:pagenumber,
                numberOfPages: books.totalPages,
                previouspage: previouspage,
                nextpage:nextpage,
                bookCount: numOfBooks,
                lowerRange: lowerRange,
                upperRange: upperRange,
                hasNextPage: books.hasNextPage,
                hasPrevPage: books.hasPrevPage,
                itemOnPageLimit: itemOnPageLimit
            })


        }).catch((err) => {
        next(err);
    });




    // User.findById(currentUser).lean()
    // .then((user) => {
    //     return Promise.all([user, Book.find({bookOwner: currentUser}).lean()]);
    //
    // }).then(([user, books]) => {
    //     return response.render('partials/profile/myprofile', {
    //         title: 'Books',
    //         page: 'profile',
    //         bookCount: books.length,
    //         books: books
    //     });
    // }).catch((err) => {
    //     next(err);
    // })




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



        response.render('partials/profile/myprofile', {
            title: 'Upload Book',
            page: 'upload'
        });



    })
    .post(upload.array('images', 7), (request, response, next) => {
        let {files} = request;
        let file_entries = request.files.length;



        async.waterfall([
            async function fileType(callback){
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
                            // console.log(request.files[i]);
                            let newFilename = request.files[i].originalname.split('.').slice(0, -1).join('.') + '.jpg'
                            // console.log(request.files[i].originalname)
                            let outputBuffer = await heicToJpeg(request.files[i].buffer);
                            request.files[i].originalname = newFilename;
                            request.files[i].mimetype = 'image/jpeg';
                            request.files[i].buffer = outputBuffer;
                            // throw new Error('All uploaded files must be images');
                        }
                        // console.log(request.files[i]);
                    }
                }
                

                if(allImages === false){
                    throw new Error('All uploaded files must be images');
                }else{
                    return ['dummy'];
                }

            },
            function getDetails([arg], callback) {
                if (request.body.title  && request.body.price && request.body.subject){


                    //Then makes an object and stores it in the mongoDB database
                    //////////////////////////////////////////////////////
                    let picURLs = [];
                    let picKeys = [];


                    let amazonBucket = process.env.S3_URL_PREFIX_FOR_RETRIEVAL;

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
            request.flash('success', 'Successfully uploaded to the BookStack')
            return response.redirect('/profile');
        });
    });


router.route('/profile/edit', mid.requiresLogin)
    .get((request, response, next) => {


        let {id} = request.query;

        Book.findById(id).lean()
            .then(book => {
                response.render('partials/profile/myprofile', {
                    title: 'Edit',
                    page: 'edit',
                    book: book
                });
            })


    })
    .post(upload.array('photos', 7),(request, response, next) => {
        let {isbn} = request.body,
            {title} = request.body,
            {author} = request.body,
            {subject} = request.body,
            {description} = request.body,
            {price} = request.body,
            {mainpic} = request.body,
            {id} = request.body,
            {files} = request;

        if (files.length > 0){ //This code only executes if a file is uploaded
            for(let i = 0 ; i < files.length ; i++){

                const fileType = files[i].mimetype.split('/')[0];
                let datetimestamp = Date.now(),
                    folderPrefix = request.session.userId + '/',
                    nameOfFile = files[i].fieldname + '-' + datetimestamp,
                    extension = '.' + files[i].originalname.split('.')[files[i].originalname.split('.').length - 1];

                let picturekey = folderPrefix + nameOfFile + extension;
                //^ example: "userid/image-3478932.jpg"^

                if (fileType !== 'image') { return next(new Error('File must be an image')); }

                let receivingparams = {
                    Bucket: "bookstackuploadedphotos",
                    Key: picturekey,
                    Body: request.files[i].buffer,
                    ACL: 'public-read'
                };

                s3.putObject(receivingparams, function(err, data){
                    if(err){return next(err)}
                });

                Book.findByIdAndUpdate(id, {$push:
                            {pictureKeys: picturekey,
                                pictureLocations:'https://bookstackrotatedphotos.s3.amazonaws.com/' + picturekey}
                    }, {new: true},
                    function(err, book){
                        if(err){return next(new Error('An error occurred while updating book'));}
                    });
                Book.findByIdAndUpdate(id, {$pull: {pictureLocations: '/img/no_image_available.jpeg'}}, //removes the default "No image available" jpg if no image was initially uploaded
                    {new: true},
                    function(err, book){
                        if(err){return next(new Error('An error occurred while updating book'))}
                    });

            }
        }

        Book.findByIdAndUpdate(id,
            {
                $set: {
                    'isbn': isbn,
                    'title': title,
                    'bookAuthor': author,
                    'description': description,
                    'price': price,
                    'subject': subject,
                    'mainpic': mainpic
                }
            },
            function (err, doc) {
                request.flash('success', 'Book successfully updated');
                return response.redirect('/profile');
            });
    });


router.get('/profile/delete', (request, response, next) => {

    Book.findById(request.query.id)
        .then(book => {
            //For security purposes, made sure that the "author" of the book is the same as the current user's ID just in case a user changes the client html
            //This section grabs the keys of all the pictures in the 'book'
            // and adds them into the AWS method for deleting
            // from the Amazon Bucket used to store pictures
            if (request.session.userId === book.bookOwner){
                return book
            }else{
                throw new Error("User id did not match the owner's id")
            }
        }).then(book => {
            for (let i = 0 ; i < book.pictureURLs.length ; i++){
                s3.deleteObject({
                    Bucket: process.env.S3_BUCKET,
                    Key: book.pictureKeys[i]
                }, function (err, data) {
                    if (err) {
                        return err
                    }
                    else {
                        console.log('Successfully deleted from S3!');
                    }
                });
            }

            return book
        }).then(book => {
            book.remove()

        }).then(() => {
            request.flash('success', 'Successfully deleted item from BookStack')
            response.redirect('/profile')
        }).catch(err => {
            next(err)
    })

});


router.route('/profile/settings')
    .get(mid.requiresLogin, (request, response, next) => {
        response.render('partials/profile/myprofile', {
            title: 'Settings',
            page: 'settings'

        });
    })
    .post(mid.requiresLogin, (request, response, next) => {
        let { firstname } = request.body,
            { lastname } = request.body,
            { email } = request.body;

        if(!(email.endsWith("@ucla.edu") || email.endsWith("@g.ucla.edu"))){
            let err = new Error("Please use your UCLA email (:")
            return next(err);
        }
        
        User.findOne({_id: request.session.userId})
            .then(user=> {
                user.firstname = firstname;
                user.lastname  = lastname;
                user.email     = email;
                user.save();
                request.session.userObject = user;
            })
            .then(() => {
                request.flash('success', 'Successfully updated preferences')
                response.redirect('/profile')
            })
            .catch(err => {
                next(err);
            })



    })




module.exports = router;