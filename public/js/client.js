const socket = io();

const chatform = $("#chat-form");
let chatmessages = $("#chat-messages-container");


let outputAJAXMessages = (msgObj) => {
    // msgObj looks like
    // msgObj = {
    //     myPenpal: penpal,
    //     messages: conversation.messages,
    //     thisuser: request.session.userId
    // }

    $("#chat-messages-container .col-12").empty();
    console.log(msgObj);
    for(let i = 0 ; i < msgObj.messages.length ; i++){
        const messageContainerDiv = document.createElement('div');
        $(messageContainerDiv).addClass("chat-message-container")

        const messageDiv = document.createElement('div');
        $(messageDiv).addClass('chat-message');

        if(msgObj.messages[i].msgSentByMe == msgObj.thisuserId)
            $(messageContainerDiv).addClass('sent');
        else
            $(messageContainerDiv).addClass('received');

        $(messageDiv).append(`<div class="message-body">${msgObj.messages[i].text}</div>
                              <div class="message-date">${msgObj.messages[i].timeSentText} ${msgObj.messages[i].dateSentText}</div>`);

        $(messageContainerDiv).append(messageDiv);
        $("#chat-messages-container .col-12").append(messageContainerDiv);

        $('#theirUserID').attr('value', msgObj.myPenpal._id);
        $(".replace-name").text(msgObj.myPenpal.firstname);
        $(".hideme").show();
    }

    setupChatMessages();
}


$(".person-container").click((event) => {
    let theirUserID = $(event.currentTarget).find(".theirUserID").text();
    let myUserID = $(event.currentTarget).find(".myUserID").text();


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

        outputAJAXMessages(res)
    });
});




let outputSocketMessage = (msg) => {
    const messageContainerDiv = document.createElement('div');
    $(messageContainerDiv).addClass("chat-message-container")

    const messageDiv = document.createElement('div');
    $(messageDiv).addClass('chat-message');

    //This may be incorrect
    if(msg.msgSentByMe == msg.thisuserId)
        $(messageContainerDiv).addClass('sent');
    else
        $(messageContainerDiv).addClass('received');

    $(messageDiv).append(`<div class="message-body">${msg.messageObject.text}</div>
        <div class="message-date">${msg.messageObject.time} ${msg.messageObject.date}</div>`);

    $(messageContainerDiv).append(messageDiv);
    $("#chat-messages-container .col-12").append(messageContainerDiv);

    setupChatMessages();
}



$("#sendMessageButton").click(() => {
    $('#addAttachmentButton').removeClass('d-none');
    $('#sendMessageButton').addClass('d-none');
    $("#chat-form").submit();
});


chatform.submit((e) => {
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
    //This scrolls the messages window down when we get a new message
    $('#chat-messages-container').scrollTop($('#chat-messages-container').prop('scrollHeight'));
});



$(document).ready(function() {
    //Shown in conversation list inside every person's name
    $('.theirUserID').hide();
    $('.myUserID').hide();


    //Used in the row when user is about to send message
    $('#theirUserID').hide();
    $('#myUserID').hide();
    $('.hideme').hide();

    $('.person-container').first().trigger('click');
});


function setupChatMessages() {
//Chat messages setup
    $('#chat-messages-container .chat-message-container').addClass('row');
    $('#chat-messages-container .chat-message-container .chat-message').addClass('col');
    $('#chat-messages-container').scrollTop($('#chat-messages-container').prop('scrollHeight'));
}