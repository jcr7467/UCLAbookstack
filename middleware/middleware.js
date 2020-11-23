/**
 * Middleware function to protect routes from logged in users
 */
let onlyForLoggedOutUsers = (request, response, next) => {
    if(request.session && request.session.userId){
        request.flash('notice', 'Invalid route for signed in users');
        return response.redirect('/profile');
    }
    return next();
}



/**
 * Middleware function for authorized user routes
 */
let onlyForLoggedInUsers = (request, response, next) => {
    if(request.session && request.session.userId){
        return next();
    } else{
        return response.redirect('/signin');
    }
};

/**
 * Middleware function for admin only routes
 */
let adminOnly = (request, response, next) => {
    if(request.session.admin === 1){
        return next();
    }else{
        let err = new Error('Insufficient Permissions');
        err.status = 401;
        return next(err);
    }
};


let setFlash = (request, response, next) => {
    response.locals.flash = {
        notice: request.flash('notice'),
        error: request.flash('error'),
        success: request.flash('success')
    };

    next();
    
};


/**
 * Middleware function for users with email verified only routes
 */
let mustHaveEmailVerified = (request, response, next) => {

    if (response.locals.currentUserObject.emailverified === false){

        request.flash('error', 'Please verify your email first you do that!')
        return response.redirect('/profile/uploadbook')
    }else{
        return next();
    }


};

module.exports.mustHaveEmailVerified = mustHaveEmailVerified;
module.exports.setFlash = setFlash;
module.exports.adminOnly = adminOnly;
module.exports.onlyForLoggedOutUsers = onlyForLoggedOutUsers;
module.exports.onlyForLoggedInUsers = onlyForLoggedInUsers;
