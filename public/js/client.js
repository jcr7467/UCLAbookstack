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


    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});




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
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span> <span>${msg.date}</span></p>
    <p class="text">
        ${msg.text}
    </p>`;
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