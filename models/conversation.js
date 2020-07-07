const mongoose = require('mongoose');




let ConversationSchema = new mongoose.Schema({
    room: String,
    messages: [{
        text: String,
        dateSent: {
            type: Date,
            default: Date.now()},
        msgSentBy: String,
        createdAt: { type: Date, default: Date.now, expires: '10m' }//1 week

    }]
});


let Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;