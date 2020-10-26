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


    // This is placed here just in case we have just made a new conversation, where the div loads in automatically
    // with "New Conversation", but click on a new person-container.
    // If we didn't have this, the newconversation div would remain there
    let $newConvoDiv = $(".new-conversation-div");
    $newConvoDiv.hide();


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


    const messageContainerDiv = document.createElement('div');
    $(messageContainerDiv).addClass("chat-message-container row")

    const messageDiv = document.createElement('div');
    $(messageDiv).addClass('chat-message col');

    if(msg.msgObj.username === myUserID)
        $(messageContainerDiv).addClass('sent');
    else
        $(messageContainerDiv).addClass('received');

    $(messageDiv).append(`<div class="message-body">${msg.msgObj.text}</div>
        <div class="message-date">${msg.msgObj.time} ${msg.msgObj.date}</div>`);

    $(messageContainerDiv).append(messageDiv);
    $chatMessagesCntr.append(messageContainerDiv);

    $chatmessages.scrollTop($chatmessages.prop('scrollHeight'));
}



$("#sendMessageButton").click(() => {
    $('#addAttachmentButton').removeClass('d-none');
    $('#sendMessageButton').addClass('d-none');
    $chatform.submit();
});



$("#chat-input").keypress(function(e) {
    let keycode = e.keyCode ? e.keyCode : e.which;
    //keycode 13 is 'Enter' key
    if (keycode == '13' && $('#chat-input').val() !== "") {
        $('#addAttachmentButton').removeClass('d-none');
        $('#sendMessageButton').addClass('d-none');
        $("#chat-form").submit();
    }
});



$chatform.submit((e) => {
    e.preventDefault();

    let msg = $("#chat-input");
    //socket.emit('chatMessage', msg);

    socket.emit('clientToServerMessage', msg.val());

    //Clear input
    msg.val('');
    if ($(window).width() >= 576)
        msg.focus();
});



socket.on('serverToClientMessage', (message) => {

    outputSocketMessage(message);
});



$(document).ready(function() {
    //Shown in conversation list inside every person's name
    $('.theirUserID').hide();
    $('.myUserID').hide();


    //Used in the row when user is about to send message
    $('#theirUserID').hide();
    $('#myUserID').hide();
    $('.hideme').hide();




    $.getJSON("/json/upload-categories.json", function(data, err){

        $.each(data, function(key, value) {

            let categoryGroup = document.createElement('optgroup');
            categoryGroup.setAttribute('label', key);
            $.each(value, function(index, JSONcategory) {
                let categoryElement = document.createElement("option");
                categoryElement.value = JSONcategory["category"]
                categoryElement.innerHTML = JSONcategory["category"]
                categoryGroup.append(categoryElement)
            })
            $('#upload-categories').append(categoryGroup)

            //Turns our select element which has all our categories into a manageable searchable set
            $('#upload-categories').select2({
                placeholder: 'Search for applicable categories',
                maximumSelectionLength: 10
            });
        })
    })






    // //Forces the first person container to be clicked resulting in the message container being populated
    // //with the messages of the top person container so it is not empty
    // //If on mobile, screen width < 576px, this does not occur.
    // if ($(window).width() >= 576)
    //     $('.person-container').first().trigger('click');
});


//This steps through all message div's and add's their needed classes
//Most of these added classes are for successful use with bootstrap
//It also forces the messages to scroll to the bottom
function setupChatMessages() {
    $('#chat-messages-container .chat-message-container').addClass('row');
    $('#chat-messages-container .chat-message-container .chat-message').addClass('col');
    $chatmessages.scrollTop($chatmessages.prop('scrollHeight'));
}










