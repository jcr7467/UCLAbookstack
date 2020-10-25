/**
 * Middleware function to protect routes from logged in users
 */
let ifLoggedIn = (request, response, next) => {
    if(request.session && request.session.userId){
        request.flash('error', 'Invalid route for signed in users');
        return response.redirect('/profile');
    }
    return next();
}

let ifLoggedOut = (request, response, next) => {
    if(request.session && request.session.userId){
        return response.redirect('/mybooks');
    }
    return next();
};

/**
 * Middleware function for authorized user routes
 */
let requiresLogin = (request, response, next) => {
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

        request.flash('notice', 'Please verify your email first you do that!')
        return response.redirect('/profile/uploadbook')
    }else{
        return next();
    }


};

module.exports.mustHaveEmailVerified = mustHaveEmailVerified;
module.exports.setFlash = setFlash;
module.exports.adminOnly = adminOnly;
module.exports.ifLoggedOut = ifLoggedOut;
module.exports.requiresLogin = requiresLogin;
module.exports.ifLoggedIn = ifLoggedIn;