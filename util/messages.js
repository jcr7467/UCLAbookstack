const moment = require('moment-timezone');
const axios = require('axios');


function formatMessage(text, username, penpalusername, room){
    let myMoment = moment();

    return {
        username,
        penpalusername,
        text,
        time: myMoment.tz("America/Los_Angeles").format('h:mm a'),
        date: myMoment.format('l'),
        room
    }
}




module.exports = formatMessage