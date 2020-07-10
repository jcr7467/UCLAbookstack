const moment = require('moment-timezone');
const axios = require('axios');


function formatMessage(text, username, penpalusername){
    let myMoment = moment();


    return {
        username,
        penpalusername,
        text,
        time: myMoment.tz("America/Los_Angeles").format('h:mm a'),
        date: myMoment.format('l')
    }
}




module.exports = formatMessage