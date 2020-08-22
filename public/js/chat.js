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

    $('.chat-messages-container').scrollTop($('.chat-messages-container').prop('scrollHeight'));
});

let resizeTimer;
$(window).resize(function() {
    fixChatWrapperHeight();

    $('.chat-wrapper').addClass('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        $('.chat-wrapper').removeClass('resize-animation-stopper');
    }, 400);
});

let $msgCntnr = $('#message-container');
let $clpseLeftBtn = $('#collapse-left');
let $xpndRightBtn = $('#expand-right');
let $xpndRightCntnr = $('#expand-right-container');
let $chatCntnr = $('#chat-container');
$clpseLeftBtn.click(function() {
    //.outWidth() misses 0.005 for whatever reason so this fixes that.
    $msgCntnr.css('margin-left', -$msgCntnr.outerWidth(true) - 0.005);
    $chatCntnr.toggleClass('col-12 col-sm-7 col-md-8');
    $xpndRightCntnr.css('display', 'flex');

    setTimeout(function () {
        $chatCntnr.css('border-left', 'none');
        $xpndRightCntnr.css('opacity', 1);
    }, 350);

});

$xpndRightBtn.click(function() {
    $xpndRightCntnr.hide();
    $xpndRightCntnr.css('opacity', '');

    setTimeout(function () {
        $chatCntnr.toggleClass('col-12 col-sm-7 col-md-8');
        $chatCntnr.css('border-left', '');
        $msgCntnr.css('margin-left', 0);
    }, 1);
});

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

let $chatInp = $('#chat-input');
$chatInp.on('input', function() {
    if ($chatInp.val() !== "") {
        $('#chat-message-btn i').removeClass('fa-plus');
        $('#chat-message-btn i').addClass('fa-paper-plane');
    }
    else {
        $('#chat-message-btn i').addClass('fa-plus');
        $('#chat-message-btn i').removeClass('fa-paper-plane');
    }
});