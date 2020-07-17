let express = require("express"),
    router  = express.Router();

let Promise = require('bluebird')


const User = require('../models/user');
const Conversation = require('../models/conversation');


router.post('/chat', (request, response, next) => {
    /*
    * This post request pops up when a user clicks on the 'Send Message' button on a book
    * */

    let userIDs = [request.session.userId, request.body.bookOwner];

    userIDs.sort();

    let room = userIDs[0].concat(userIDs[1]);




    Conversation.findOne({room: room }).lean()
        .then(conversation => {
            if (conversation !== null) {
                //console.log(conversation.messages)
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


                User.findById(username)
                    .then(user => {

                        user.hasConversationsWith.push({
                            thePenPal: penpalusername
                        })

                        user.save()
                        request.session.userObject = user;

                    })
                    .then(() => {
                        return User.findById(penpalusername)
                    })
                    .then(penpaluser => {
                        penpaluser.hasConversationsWith.push({
                            thePenPal: username
                        })
                        penpaluser.save()
                    })
                    .catch(err => {
                        response.send(err)
                    })



            }else {



                conversation.messages.push({
                    text: msgObj.text,
                    msgSentByMe: username,
                    msgSentToThem: penpalusername,
                    timeSentText: time,
                    dateSentText: date
                })
                conversation.save()

                return response.send({text: 'i passed apparently'})

            }
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
                    //But every
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