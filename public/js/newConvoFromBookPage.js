// let button = document.getElementById("sendMessageButtonWrapper");
// let input = document.getElementById("send-message-form")
// button.classList.remove("hideme")
// input.classList.remove("hideme")
theirUserID = document.getElementById("theirUserID").value
myUserID = document.getElementById("myUserID").value

let userIDs = [myUserID, theirUserID]
userIDs.sort();
let room = userIDs[0].concat(userIDs[1])

//join chatroom
socket.emit('joinRoom', {myUserID, theirUserID, room});

