const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");




let UserSchema = new mongoose.Schema({
    adminLevel: {
        type: Number,
        default: 0
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    datejoined:{
        type: Date,
        default: Date.now()
    }
});


let User = mongoose.model('User', UserSchema);
module.exports = User;