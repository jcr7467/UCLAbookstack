$(document).ready(function() {
    //Forces the first person container to be clicked resulting in the message container being populated
    //with the messages of the top person container so it is not empty
    //If on mobile, screen width < 576px, this does not occur.
    if ($(window).width() >= 576)
        $('.person-container').first().trigger('click');
})