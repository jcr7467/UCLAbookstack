const mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate');


let BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    bookAuthor: {
        type: String,
        trim: true,
        required: true
    },
    isbn: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    subject: String,
    pictureLocations: {
        type: Array
    },
    pictureKeys: [{
        type: String
    }],
    mainpic: {
        type: String,
        default: '/img/no_image_available.jpg'
    },
    email: String,
    bookOwner: String,
    comments: [{
        type: String,
        date: Date.now(),
        commentBy: String
    }],
    dateAdded:{
        type: Date,
        default: Date.now()
    }
});

BookSchema.plugin(mongoosePaginate);


BookSchema.pre("save", function (next) {
    if (this.pictureLocations.length === 0)
        this.pictureLocations.push('/img/no_image_available.jpg');

    next();
});







let Book = mongoose.model('Book', BookSchema);
module.exports = Book;