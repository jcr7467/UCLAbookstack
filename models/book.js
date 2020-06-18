const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

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
        default: '/img/no_image_available.jpeg'
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


//We add in this plugin so that we can return a certain array and paginate between lots of books
BookSchema.plugin(mongoosePaginate);

let Book = mongoose.model('Book', BookSchema);
module.exports = Book;