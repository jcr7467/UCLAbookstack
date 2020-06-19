const socket = io();
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages');



//Get username and room
const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log(username, room)

//join chatroom
socket.emit('joinRoom', {username, room});

socket.on('message', (message) => {

    console.log(message);
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
    }
);