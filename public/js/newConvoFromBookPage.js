// When the send message button is clicked on a post page,
// it pops up the modal that contains the form to send a message to that user
// When a new message is sent from a post page, we just join the room and send the message.


$(document).ready(function () {



    $("#send_new_message_from_post_button").click(function () {
        $('#newsletterModal').modal('show');
    });

    $("#new_message_modal_form").submit(function (e) {

        e.preventDefault();

        //Gather details
        myUserID = $("#myUserID").val();
        theirUserID = $("#theirUserID").val();
        let userIDs = [myUserID, theirUserID]
        userIDs.sort();
        let room = userIDs[0].concat(userIDs[1])
        let msg = $("#new_message_text_textarea");

        //Join room and send message, then hide modal
        socket.emit('joinRoom', {myUserID, theirUserID, room});
        socket.emit('clientToServerMessage', msg.val());
        $('#newsletterModal').modal('hide');
    })




})

