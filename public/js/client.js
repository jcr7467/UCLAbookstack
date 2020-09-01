const socket = io();

const $chatform = $("#chat-form");
let $chatmessages = $("#chat-messages-container");
const $chatMessagesCntr = $("#chat-messages-container .col-12");

let theirUserID,
    myUserID;


let outputAJAXMessages = (msgObj) => {
    // msgObj looks like
    // msgObj = {
    //     myPenpal: penpal,
    //     messages: conversation.messages,
    //     thisuser: request.session.userId
    // }

    $chatMessagesCntr.empty();
    console.log(msgObj);
    for(let i = 0 ; i < msgObj.messages.length ; i++){
        const messageContainerDiv = document.createElement('div');
        $(messageContainerDiv).addClass("chat-message-container")

        const messageDiv = document.createElement('div');
        $(messageDiv).addClass('chat-message');

        if(msgObj.messages[i].msgSentByMe === msgObj.thisuserId)
            $(messageContainerDiv).addClass('sent');
        else
            $(messageContainerDiv).addClass('received');

        $(messageDiv).append(`<div class="message-body">${msgObj.messages[i].text}</div>
                              <div class="message-date">${msgObj.messages[i].timeSentText} ${msgObj.messages[i].dateSentText}</div>`);

        $(messageContainerDiv).append(messageDiv);
        $chatMessagesCntr.append(messageContainerDiv);

        $('#theirUserID').attr('value', msgObj.myPenpal._id);
        $(".replace-name").text(msgObj.myPenpal.firstname);
        $(".hideme").show();
    }

    setupChatMessages();
}


function setupChatMessages() {
//Chat messages setup
    $('#chat-messages-container .chat-message-container').addClass('row');
    $('#chat-messages-container .chat-message-container .chat-message').addClass('col');
}

$(".person-container").click((event) => {
    theirUserID = $(event.currentTarget).find(".theirUserID").text();
    myUserID = $(event.currentTarget).find(".myUserID").text();

    let userIDs = [myUserID, theirUserID]
    userIDs.sort();
    let room = userIDs[0].concat(userIDs[1])

    //join chatroom
    socket.emit('joinRoom', {myUserID, theirUserID, room});

    $.ajax({
        method: "POST",
        url: "/ajaxmessageload",
        data: { myUserID: myUserID, theirUserID: theirUserID }
    }).done(function( res ) {

        outputAJAXMessages(res, myUserID, theirUserID)
    });
    let msg = $("#chat-input");
    msg.val('');
    if ($(window).width() >= 576)
        msg.focus();
});




let outputSocketMessage = (msg) => {
    /* This is what the msg object looks like
                {
                    msgObj: msgObj,
                    currentUserid: response.data.currentUserid,
                    currentUserfirstname: response.data.currentUserfirstname,
                    penpalUserid: response.data.penpalUserId,
                    penpalUserfirstname: response.data.penpalUserfirstname
                }
    * */


    // Create a new message div
    const messageDiv = document.createElement('div');
    $(messageDiv).addClass('chat-message');
    $(messageDiv).append(`<div class="message-body">${msg.msgObj.text}</div>
        <div class="message-date">${msg.msgObj.time} ${msg.msgObj.date}</div>`);

    // Create a container for the message div above and append the message to this container
    const messageContainerDiv = document.createElement('div');
    $(messageContainerDiv).addClass("chat-message-container")
    $(messageContainerDiv).append(messageDiv);
    if(msg.msgObj.username === myUserID){
        $(messageContainerDiv).addClass('sent');
    } else{
        $(messageContainerDiv).addClass('received');
    }

    // Append the container above into the outermost container
    $chatMessagesCntr.append(messageContainerDiv);

    setupChatMessages();
}



$("#sendMessageButton").click(() => {
    $('#addAttachmentButton').removeClass('d-none');
    $('#sendMessageButton').addClass('d-none');
    $chatform.submit();
});



$("#chat-input").keypress(function(e) {
    let keycode = e.keyCode ? e.keyCode : e.which;
    //keycode 13 is 'Enter' key
    if (keycode == '13') {
        $('#addAttachmentButton').removeClass('d-none');
        $('#sendMessageButton').addClass('d-none');
        $("#chat-form").submit();
    }
});


$chatform.submit((e) => {
    e.preventDefault();

    let msg = $("#chat-input");
    //socket.emit('chatMessage', msg);

    socket.emit('chatMessage', msg.val());

    //Clear input
    msg.val('');
    msg.focus();

});


socket.on('serverToClientMessage', (message) => {
    console.log(message)
    outputSocketMessage(message)

    //console.log(message)
});



$(document).ready(function() {
    //Shown in conversation list inside every person's name
    $('.theirUserID').hide();
    $('.myUserID').hide();


    //Used in the row when user is about to send message
    $('#theirUserID').hide();
    $('#myUserID').hide();
    $('.hideme').hide();

    //Forces the first person container to be clicked resulting in the message container being populated
    //with the messages of the top person container so it is not empty
    //If on mobile, screen width < 576px, this does not occur.
    if ($(window).width() >= 576)
        $('.person-container').first().trigger('click');
});


//This steps through all message div's and add's their needed classes
//Most of these added classes are for successful use with bootstrap
//It also forces the messages to scroll to the bottom
function setupChatMessages() {
    $('#chat-messages-container .chat-message-container').addClass('row');
    $('#chat-messages-container .chat-message-container .chat-message').addClass('col');
    $chatmessages.scrollTop($chatmessages.prop('scrollHeight'));
}