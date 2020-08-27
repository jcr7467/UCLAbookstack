const socket = io();

const chatform = $("#chat-form");
let chatmessages = $("#chat-messages-container");

let theirUserID,
    myUserID;


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
    $("#chat-messages-container .col-12").append(messageContainerDiv);
    $('#chat-messages-container').scrollTop($('#chat-messages-container').prop('scrollHeight'));
    setupChatMessages();


    //This was used before to autoscroll on new message, now lays unused, here for future reference
    //chatmessages.scrollTop = chatmessages.scrollHeight;
}



$(".sendMessageButton").click(() => {
    chatform.submit();
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



$(document).ready(
    function() {
        //Shown in conversation list inside every person's name
        $('.theirUserID').hide();
        $('.myUserID').hide();


        //Used in the row when user is about to send message
        $('#theirUserID').hide();
        $('#myUserID').hide();
        $('.hideme').hide();
    }
);


