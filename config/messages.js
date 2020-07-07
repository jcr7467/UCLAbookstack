const moment = require('moment-timezone');
const axios = require('axios');


function formatMessage(username, text){
    let myMoment = moment();


    return {
        username,
        text,
        time: myMoment.tz("America/Los_Angeles").format('h:mm a'),
        date: myMoment.format('l')
    }
}




module.exports = formatMessage