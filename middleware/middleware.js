let convert = require('heic-convert');



let ifLoggedOut = (request, response, next) => {
    if(request.session && request.session.userId){
        return response.redirect('/mybooks');
    }
    return next();
};


let requiresLogin = (request, response, next) => {
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




module.exports.setFlash = setFlash;
module.exports.adminOnly = adminOnly;
module.exports.ifLoggedOut = ifLoggedOut;
module.exports.requiresLogin = requiresLogin;