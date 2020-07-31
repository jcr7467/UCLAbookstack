/*

    express:    NodeJS framework
    router:     What will be routing our urls
    Promise:    Full fledged promise library, Currently only used to call Promise.map
                when we find all conversations a particular user has

    User:       Our user model used to interact with MongoDb
    Conversation: Our conversation model where we store our messages between users
    Conversation: Our middleware that we use to perform functions before they get to our requests

* */

let express = require("express"),
    router  = express.Router();
let Promise = require('bluebird')
const User = require('../models/user');
const Conversation = require('../models/conversation');
const mid = require('../middleware/middleware');




// This is not used right now, but we will transition from post to get requests for messages.
// We will need to have a check to make sure that the user is one of the queries in the URL
router.get('/messages', (request, response, next) => {

    response.render('chat', {
        title: "Chat"
    });

});




//
// This post request pops up when a user clicks on the 'Send Message' button on a book
//
router.post('/chat', mid.mustHaveEmailVerified,  (request, response, next) => {

    // In order to make the room deterministic, we take both the user's ids, and sort them.
    // We then concatinate the ids and use this as the room number
    let userIDs = [request.session.userId, request.body.bookOwner];
    userIDs.sort();
    let room = userIDs[0].concat(userIDs[1]);


    // Lean command in order for handlebars to read it.
    // In order to turn it into a json object
    Conversation.findOne({room: room }).lean()
        .then(conversation => {

            return Promise.all([conversation, User.findById(request.body.bookOwner).lean()])


        }).then(([conversation, penpal]) => {
        if(conversation == null){

            //If there are no messages, dont send a null object
            return response.render('chat', {
                title: "Messages",
                myPenpal: penpal,
                thisuser: request.session.userId
            })

        }else{
            return response.render('chat', {
                title: "Messages",
                myPenpal: penpal,
                messages: conversation.messages,
                thisuser: request.session.userId
            })
        }

    }).catch(err => {
        next(err);
    })
});







router.post('/sendmessage', (request, response, next) => {
    /*
    * This post request comes from app.js, and is not directly submitted by the user
    * because of this, we do not have the request.session variables, like the userID
    * */


    let { msgObj } = request.body;
    let { penpalusername } = msgObj;
    let { username } = msgObj;
    let { room } = request.body;
    let { time } = msgObj;
    let { date } = msgObj;


    Conversation.findOne({room: room})
        .then((conversation) => {
            if (conversation === null){

                let conversationData = {
                    room: room,
                    penpal1: username,
                    penpal2: penpalusername,
                    messages: [{
                        text: msgObj.text,
                        msgSentByMe: username,
                        msgSentToThem: penpalusername,
                        timeSentText: time,
                        dateSentText: date
                    }]
                }

                Conversation.create(conversationData);
                return false
            }else {
                conversation.messages.push({
                    text: msgObj.text,
                    msgSentByMe: username,
                    msgSentToThem: penpalusername,
                    timeSentText: time,
                    dateSentText: date
                })
                conversation.save()
                return true
            }
        })
        .then(conversationFoundBool => {


            return Promise.all([conversationFoundBool, User.findById(username), User.findById(penpalusername)])




        })
        .then(([conversationFoundBool, currentUser, penpalUser]) => {

            if(!conversationFoundBool){

                currentUser.hasConversationsWith.push({
                    thePenPal: penpalusername
                })
                currentUser.save()
                request.session.user = currentUser;
            }

            return Promise.all([conversationFoundBool, currentUser, penpalUser])


        })
        .then(([conversationFoundBool, currentUser, penpalUser]) => {

            if (!conversationFoundBool){
                penpalUser.hasConversationsWith.push({
                    thePenPal: username
                })
                penpalUser.save()
            }

            return Promise.all([currentUser, penpalUser])


        })
        .then(([currentUser, penpalUser]) => {

            response.send({
                currentUserid: currentUser._id,
                currentUserfirstname: currentUser.firstname,
                penpalUserid: penpalUser._id,
                penpalUserfirstname: penpalUser.firstname,
            })

        })
        .catch(err => {

            console.log(err)

        });

});






router.route('/conversations').get((request, response, next) => {

    User.findById(request.session.userId).lean()
        .then(user => {

            /*
             * given a value and an optional array (accum),
             * pass the value to the async func and add its result to accum
             * if accum is not an array, make it one
             * return accum
             */
            let push_penpal_to_userMap = (penpalObj, userMap) => {
                // on first pass, accum will be undefined, so make it an array
                let penPalUserId = penpalObj.thePenPal
                userMap = Array.isArray(userMap) ? userMap : []

                return new Promise((resolve, reject) => {

                    User.findById(penPalUserId).lean().exec((err, penpal)=> {
                        if (err){reject(err)}
                        if (penpal !== null){

                            userMap.push({
                                penpalUserId: penpal._id,
                                penpalFirstName: penpal.firstname,
                                penpalLastName: penpal.lastname
                            })

                            resolve(userMap)
                        }
                    });
                })
            }


            /*
             * for each member of input array, apply do_something
             * then operate on accumulated result.
             */


            Promise.map(user.hasConversationsWith, push_penpal_to_userMap)
                .then(userMap => {
                    // results will contain the accumulated results from all
                    // the mapped operations


                    //For some reason, this userMap is a two dimensional array,
                    // So in handlebars, we must have a two dimmensional array for each loop
                    //
                    response.render('conversation_list', {
                        title: 'Messages',
                        myPenPals: userMap
                    })

                })
                .catch(err => {
                    next(err)
                })


        }).catch(err => {
            return next(err)
        })
})





module.exports = router;