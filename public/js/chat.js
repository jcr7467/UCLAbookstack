function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE");

    return msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
}

function fixChatWrapperHeight() {
    //Set height of elements in chat box to maintain overflow issues
    let chatWrapperHeight = $('.chat-wrapper').height();

    let peopleSelectContainer = $('.people-select-container');
    let peopleSelectContainerTopPos = peopleSelectContainer.position().top;
    peopleSelectContainer.css("max-height", chatWrapperHeight - peopleSelectContainerTopPos);

    let chatMessagesContainer = $('.chat-messages-container');
    let chatHeader = $('.chat-header');
    let chatNewContainer = $('.chat-new-container');
    chatMessagesContainer.css("height", chatWrapperHeight - chatHeader.height() - chatNewContainer.height());
}

$(document).ready(function(){
    fixChatWrapperHeight();

    if (msieversion()) {
        $('.filter-button img').each(function() {
            $(this).css('position', 'relative');
        });
    }
});

$(window).resize(function() {
    fixChatWrapperHeight();
})

$('.filter-button').click(function () {
    $('.filter-button').each(function(){
        $(this).removeClass('active');
    });
    $(this).addClass('active');
});

$('.person-container').click(function () {
    $('.person-container').each(function(){
        $(this).removeClass('active');
    });
    $(this).addClass('active');
});