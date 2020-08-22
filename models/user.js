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
        //This is the entire URL, but if an image is not imported,
        // we don't have a AWS S3 link to refer to, so we use the default
        default: '/images/profile/default-profile-icon.svg'

    },
    profilePictureKey: {
        type: String,
        default: '/images/profile/default-profile-icon.svg'
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
    }],
    appearAnonymousInPosts: {
        type: Boolean,
        default: false
    },
    verifyEmailToken: String

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

    //If email is updated
    if (this.isModified('email')){

        this.emailverified = false;
    }

    if (this.isModified('password')){
        let user = this;
        bcryptjs.hash(user.password, 10, (err, hash) => {
            if(err){
                return next(err);
            }
            user.password = hash;
            next();
        });
    }else{
        next();
    }


});


let User = mongoose.model('User', UserSchema);
module.exports = User;