let express = require("express"),
    router  = express.Router();


const User = require('../models/user');
const Conversation = require('../models/conversation');


router.post('/chat', (request, response, next) => {

    let userIDs = [request.session.userId, request.body.bookOwner];

    userIDs.sort();

    let room = userIDs[0].concat(userIDs[1]);
    console.log(room)


    Conversation.findOne({room: room }).lean()
        .then(conversation => {
            if (conversation !== null) {
                console.log(conversation.messages)
                response.render('chat', {
                    title: "Messages",
                    messagesWith: request.body.bookOwner,
                    messages: conversation.messages,
                    thisuser: request.session.userId
                })
            }else{
                response.render('chat', {
                    title: "Messages",
                    messagesWith: request.body.bookOwner
                })

            }
        })
        .catch(err => {
            next(err);
        })




});





router.post('/sendmessage', (request, response, next) => {


    //console.log(request)
    let { msgObj } = request.body;
    let { room } = request.body;




    Conversation.findOne({room: room})
        .then((conversation) => {
            if (conversation === null){
                let conversationData = {
                    room: room,
                    messages: [{
                        text: msgObj.text,
                        msgSentBy: msgObj.username,
                    }]
                }

                return Conversation.create(conversationData);

            }else {
                conversation.messages.push({
                    text: msgObj.text,
                    msgSentBy: msgObj.username
                })
                conversation.save()
                console.log('i found it already actually awkward')
            }
        })
        .then(()=> {
            response.send({msgPostSucceeded: true});
        })
        .catch(err => {
            console.log(err)
        });



});




module.exports = router;