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





$(document).ready(
    function() {
        $('#formfilt').hide()
        $('#theirUserID').hide()
        $('#myUserID').hide()
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

);