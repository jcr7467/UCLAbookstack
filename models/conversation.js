const mongoose = require('mongoose');




let ConversationSchema = new mongoose.Schema({
    room: String,
    messages: [{
        type: String,
        date: Date.now(),
        sentby: String
    }]
});


let Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = User;