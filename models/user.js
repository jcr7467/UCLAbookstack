const mongoose = require('mongoose'),
    bcryptjs = require('bcryptjs');


let UserSchema = new mongoose.Schema({
    admin_level:{
        type: Number,
        default: 0
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    firstname: {
        type: String,
        trim: true,
    },
    lastname: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetPasswordTokenValid: Boolean,
    profilePictureURL: {
        type: String,
        default: '/images/profile/default-profile.png'
    },
    profilePictureKey: {
        type: String,
        default: '/images/profile/default-profile.png'
    },
    emailverified:{
        type: Boolean,
        default: false
    },
    datejoined:{
        type: Date,
        default: Date.now()
    },
    major: String,
    hasConversationsWith: [{
        thePenPal: String
    }]
});


////Authenticate input against database documents
UserSchema.statics.authenticate = (email, password, callback) =>{
    User.findOne({ email: email})
        .exec((error, user) => {
            if(error){
                return callback(error);
            } else if (!user){
                let err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcryptjs.compare(password, user.password, (error, result) => {
                if(result === true){
                    return callback(null, user);
                }else{
                    return callback();
                }
            });
        });
};


////Hash password before saving to database
UserSchema.pre('save', function(next){
    let user = this;
    bcryptjs.hash(user.password, 10, (err, hash) => {
        if(err){
            return next(err);
        }
        user.password = hash;
        next();
    });
});


let User = mongoose.model('User', UserSchema);
module.exports = User;