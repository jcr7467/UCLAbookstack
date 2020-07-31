
let ifLoggedOut = (request, response, next) => {
    if(request.session && request.session.userId){
        return response.redirect('/mybooks');
    }
    return next();
};


let requiresLogin = (request, response, next) => {
    console.log('sup bro000')
    if(request.session && request.session.userId){
        return next();
    } else{
        return response.redirect('/signin');
    }
};




let adminOnly = (request, response, next) => {
    if(request.session.admin === true){
        return next();
    }else{
        let err = new Error('Access denied');
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
module.exports.ifLoggedOut = ifLoggedOut;
module.exports.requiresLogin = requiresLogin;