let express = require("express"),
    router  = express.Router();


const User = require('../models/user');


router.post('/chat', (request, response, next) => {
    response.render('chat', {
        title: "Messages",
        messagesWith: request.body.bookOwner
    })
});





router.post('/sendmessage', (request, response, next) => {


    //console.log(request)
    let { msgObj } = request.body;

    console.log(msgObj.username);
    console.log(msgObj.text);
    let respObj = {
        msg: "Hellooo i think you were expecting me"
    }
    response.send(respObj);


});




module.exports = router;