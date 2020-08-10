const mongoose = require('mongoose');




let ConversationSchema = new mongoose.Schema({
    room: String,
    penpal1: String,
    penpal2: String,
    messages: [{
        dateSentFromServer: {
            type: Date,
            default: Date.now()
        },
        text: String,
        msgSentByMe: String,
        msgSentToThem: String,
        timeSentText: String,
        dateSentText: String
    }]
});


let Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;