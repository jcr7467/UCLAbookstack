
/*


const socket = io();
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')

const myUserID = document.getElementById('myUserID').value
const theirUserID = document.getElementById('theirUserID').value



let userIDs = [myUserID, theirUserID]

userIDs.sort();

let room = userIDs[0].concat(userIDs[1])
let username = myUserID;

console.log(myUserID)
console.log(theirUserID)


//join chatroom
socket.emit('joinRoom', {myUserID, theirUserID, room});

socket.on('message', (message) => {

    console.log(message);

    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('serverObject', (obj) => {
    console.log("Server's response")
    console.log(obj)

})



chatForm.addEventListener('submit', (e) => {


   e.preventDefault();


   const msg = e.target.elements.msg.value;
   socket.emit('chatMessage', msg);

   //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();


});




function outputMessage(msg){
    const div = document.createElement('div');

    console.log('mine', myUserID)
    console.log('msgcurrent', msg.currentUserid)

    if (myUserID == msg.currentUserid){
        div.classList.add('message');
        div.innerHTML = `<p class="meta">${msg.currentUserfirstname} <span>${msg.messageObject.time}</span> <span>${msg.messageObject.date}</span></p>
        <p class="text">
            ${msg.messageObject.text}
        </p>`;
    }else{

        div.classList.add('penpalmessage');
        div.innerHTML = `<p class="meta">${msg.currentUserfirstname} <span>${msg.messageObject.time}</span> <span>${msg.messageObject.date}</span></p>
        <p class="text">
            ${msg.messageObject.text}
        </p>`;

    }



    document.querySelector('.chat-messages').appendChild(div);

}


*/


const socket = io();

const chatform = $("#send-message-form");
let chatmessages = $(".chat-messages-container")


let outputAJAXMessages = (msgObj) => {
    // msgObj looks like
    // msgObj = {
    //     myPenpal: penpal,
    //     messages: conversation.messages,
    //     thisuser: request.session.userId
    // }

    $(".chat-messages-container").empty()
    console.log(msgObj)
    for(let i = 0 ; i < msgObj.messages.length ; i++){
        const div = document.createElement('div');
        div.classList.add("chat-message")

        if(msgObj.messages[i].msgSentByMe == msgObj.thisuserId){
            div.innerHTML = `<div style="width: 100%" class="message">
                            <p class="meta">${msgObj.thisuserFirstname} <span>${msgObj.messages[i].timeSentText}</span> <span>${msgObj.messages[i].dateSentText}</span></p>
                            <p class="text">
                              ${msgObj.messages[i].text}
                            </p>
                    </div><br>`;
        }else{
            div.innerHTML = `<div style="width: 100%" class="message">
                            <p class="meta">${msgObj.myPenpal.firstname} <span>${msgObj.messages[i].timeSentText}</span> <span>${msgObj.messages[i].dateSentText}</span></p>
                            <p class="text">
                              ${msgObj.messages[i].text}
                            </p>
                    </div><br>`;
        }

        document.querySelector('.chat-messages-container').appendChild(div);

        $("#theirUserID").val(msgObj.myPenpal._id)
        $(".replace-name").text(msgObj.myPenpal.firstname);
        $(".hideme").show()

    }


}

$(".chatdivlink").click((event) => {
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




})




let outputSocketMessage = (msg) => {

    const div = document.createElement('div');

    //div.classList.add('message');

    div.innerHTML = `<div class="message">
                        <p class="meta">${msg.currentUserfirstname} <span>${msg.messageObject.time}</span> <span>${msg.messageObject.date}</span></p>
                        <p class="text">
                         ${msg.messageObject.text}
                        </p>
                    </div>`;

    $(".chat-messages-container").append(div)
    chatmessages.scrollTop = chatmessages.scrollHeight;


}



$("#sendMessageButton").click(() => {
    chatform.submit()
})


chatform.submit((e) => {
    e.preventDefault()

    let msg = $("#sendMessageInput")
    //socket.emit('chatMessage', msg);

    socket.emit('chatMessage', msg.val())

    //Clear input
    msg.val('')
    msg.focus()

})



socket.on('serverToClientMessage', (message) => {
    console.log(message)
    outputSocketMessage(message)

    //console.log(message)
    //This scrolls the messages window down when we get a new message
    chatmessages.scrollTop = chatmessages.scrollHeight;
})









$(document).ready(
    function() {
        // $('#formfilt').hide()
        //Shown in conversation list inside every person's name
        $('.theirUserID').hide()
        $('.myUserID').hide()


        //Used in the row when user is about to send message
        $('#theirUserID').hide()
        $('#myUserID').hide()
        $('.hideme').hide()
        // chatMessages.scrollTop = chatMessages.scrollHeight;
    }

);


