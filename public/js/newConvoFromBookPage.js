let button = document.getElementById("sendMessageButtonWrapper");
let input = document.getElementById("send-message-form")
button.classList.remove("hideme")
input.classList.remove("hideme")
let theirUserID = document.getElementById("theirUserID").value
let myUserID = document.getElementById("myUserID").value
console.log(myUserID, theirUserID)

let userIDs = [myUserID, theirUserID]
userIDs.sort();
let room = userIDs[0].concat(userIDs[1])
console.log(room)

//join chatroom
socket.emit('joinRoom', {myUserID, theirUserID, room});

