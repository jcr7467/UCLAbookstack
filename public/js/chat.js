let screenWidth;
$(document).ready(function(){
    setupPeopleSelect();
    setupChatMessages();
    fixChatAndPplCntrHeights();

    //Fix issues associated with internet explorer
    if (msieversion()) {
        $('.filter-button i').each(function() {
            $(this).css('position', 'relative');
        });

        $('.chat-message-container .chat-message').each(function() {
            $(this).css('max-width', '100%');
        });
    }

    //Force the messages containers scroll bar to the bottom on load
    $('#chat-messages-container').scrollTop($('#chat-messages-container').prop('scrollHeight'));

    //Remove active person on page load
    if ($(window).width() < 576) {
        $('.person-container').each(function(){
            $(this).removeClass('active');
        });
    }

    screenWidth = $(window).width();
});



let resizeTimer; //Remove transition time during screen resize
$(window).resize(function() {
    fixChatAndPplCntrHeights();

    //Remove transition time
    $('.chat-wrapper').addClass('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        $('.chat-wrapper').removeClass('resize-animation-stopper');
    }, 400);

    //Force sidebar to expand
    expandBar();

    //Remove active person
    if ($(window).width() < 576) {
        $('.person-container').each(function(){
            $(this).removeClass('active');
        });
    }

    //Reset margin on message container only if the screen width changed.
    //This is required for mobile devices otherwise scrolling up/down on mobile and expanding/contracting the
    //search bar at the top of the screen will cause the message container position to move.
    if (screenWidth != $(window).width()) {
        screenWidth = $(window).width();
        $msgCntnr.css('margin-top', '');
    }
});



//Returns true if the user is using internet explorer
function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE");

    return msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
}



//Sets the height of the chat wrapper to fit pixel perfect regardless of screen size
function fixChatAndPplCntrHeights() {
    //Set height of elements in chat box to maintain overflow issues
    let chatWrapperHeight = $('.chat-wrapper').height();
    let peopleSelectContainer = $('#people-select-container');
    let peopleSelectContainerTopPos = peopleSelectContainer.position().top;
    peopleSelectContainer.css("height", chatWrapperHeight - peopleSelectContainerTopPos);

    let chatMessagesContainer = $('#chat-messages-container');
    let chatHeader = $('#chat-header');
    let chatNewContainer = $('#chat-new-container');
    chatMessagesContainer.css("height", chatWrapperHeight - chatHeader.height() - chatNewContainer.height());
}




//**********************************
//Setup START
//**********************************
function setupPeopleSelect() {
//Person select list setup
    $('.person-name-and-icon').addClass('row');
    $('.person-name-and-icon h5').addClass('col-10 col-sm-9 col-md-10 col-lg-11');
    $('<i class="far fa-arrow-alt-circle-left"></i>').insertAfter('.person-container.buying h5');
    $('<i class="far fa-arrow-alt-circle-right"></i>').insertAfter('.person-container.selling h5');
    $('.person-container i').addClass('col-2 col-sm-3 col-md-2 col-lg-1 p-md-0');
}
//**********************************
//Setup END
//**********************************



//**********************************
//Expanding/Collapsing Sidebar START
//**********************************
let $msgCntnr = $('#message-container');
let $clpseLeftBtn = $('#collapse-left');
let $xpndRightBtn = $('#expand-right');
let $xpndRightCntnr = $('#expand-right-container');
let $chatCntnr = $('#chat-container');

//Event listeners on expanding and collapsing arrows
$clpseLeftBtn.click(function() {collapseBar(350)});
$xpndRightBtn.click(function() {expandBar()});

function collapseBar(time) {
    //.outWidth() misses 0.005 for whatever reason so this fixes that.
    if (!msieversion())
        $msgCntnr.css('margin-left', -$msgCntnr.outerWidth(true) - 0.005);
    else
        $msgCntnr.css('margin-left', -$msgCntnr.outerWidth(true) - 1);
    $chatCntnr.removeClass('col-sm-7 col-md-8');
    $xpndRightCntnr.css('display', 'flex');

    setTimeout(function () {
        $chatCntnr.css('border-left', 'none');
        $xpndRightCntnr.css('opacity', 1);
    }, time);
}

function expandBar() {
    $xpndRightCntnr.hide();
    $xpndRightCntnr.css('opacity', '');

    setTimeout(function () {
        $chatCntnr.addClass('col-sm-7 col-md-8');
        $chatCntnr.css('border-left', '');
        $msgCntnr.css('margin-left', '');
    }, 1);
}
//**********************************
//Expanding/Collapsing Sidebar END
//**********************************



//**********************************
//People Search Bar START
//**********************************
let $pplSearch = $('#message-search');
$pplSearch.on('input', function() {
    let searchVal = $pplSearch.val().toLowerCase();
    $('#people-select-container .person-container').filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(searchVal) > -1);
    });

    $('.filter-button').each(function(){
        $(this).removeClass('active');
    });
    $('#all-filter').addClass('active');
});
//**********************************
//People Search Bar END
//**********************************



//**********************************
//Active Filter START
//**********************************
$('.filter-button').click(function () {
    $('.filter-button').each(function(){
        $(this).removeClass('active');
    });
    $(this).addClass('active');

    switch ($(this).attr('id')) {
        case "buying-filter":
            $('#people-select-container .person-container').filter(function() {
                $(this).toggle($(this).find('i').hasClass('fa-arrow-alt-circle-left'));
            });
            break;
        case "selling-filter":
            $('#people-select-container .person-container').filter(function() {
                $(this).toggle($(this).find('i').hasClass('fa-arrow-alt-circle-right'));
            });
            break;
        default:
            $('#people-select-container .person-container').filter(function() {
                $(this).toggle($(this).find('i').hasClass('fa-arrow-alt-circle-right') || $(this).find('i').hasClass('fa-arrow-alt-circle-left'));
            });
    }
});
//**********************************
//Active Filter END
//**********************************



//**********************************
//Active Person START
//**********************************
$('.person-container').click(function () {
    $('.person-container').each(function(){
        $(this).removeClass('active');
    });
    $(this).addClass('active');
    populateActivePersonData(this)

    if ($(window).width() < 576) {
        $msgCntnr.css('margin-top', -$('.chat-wrapper').height())
    }
});

$('#expand-down').click(function() {
    $('.person-container').each(function(){
        $(this).removeClass('active');
    });
    $msgCntnr.css('margin-top', '');
});

function populateActivePersonData(activePersonCntr) {
    let $chatPersonName = $('#chat-person-name');
    let $chatBookName = $('#chat-book-name');
    $chatPersonName.text($(activePersonCntr).find('h5').text());
    $chatPersonName.attr('title', $(activePersonCntr).find('h5').text());
    $chatPersonName.attr('data-original-title', $(activePersonCntr).find('h5').text());
    $chatBookName.text($(activePersonCntr).find('h6').text());
    $chatBookName.attr('title', $(activePersonCntr).find('h6').text());
    $chatBookName.attr('data-original-title', $(activePersonCntr).find('h6').text());

    if ($(activePersonCntr).hasClass('buying')) {
        $('#chat-buy-sell').addClass('buying');
        $('#chat-buy-sell').removeClass('selling');
    }
    else {
        $('#chat-buy-sell').addClass('selling');
        $('#chat-buy-sell').removeClass('buying');
    }
}
//**********************************
//Active Person END
//**********************************



//**********************************
//Chat Input START
//**********************************
let $chatInp = $('#chat-input');
$chatInp.on('input', function() {
    if ($chatInp.val() !== "") {
        $('#addAttachmentButton').addClass('d-none');
        $('#sendMessageButton').removeClass('d-none');
    }
    else {
        $('#addAttachmentButton').removeClass('d-none');
        $('#sendMessageButton').addClass('d-none');
    }
});
//**********************************
//Chat Input END
//**********************************

//**********************************
//Chat Send START
//**********************************
$("#sendMessageButton").click(() => {
    $('#addAttachmentButton').removeClass('d-none');
    $('#sendMessageButton').addClass('d-none');
    $chatform.submit();
});



$("#chat-input").keypress(function(e) {
    let keycode = e.keyCode ? e.keyCode : e.which;
    //keycode 13 is 'Enter' key
    if (keycode == '13' && $('#chat-input').val() !== "") {
        $('#addAttachmentButton').removeClass('d-none');
        $('#sendMessageButton').addClass('d-none');
        $("#chat-form").submit();
    }
});



$chatform.submit((e) => {
    e.preventDefault();

    let msg = $("#chat-input");
    //socket.emit('chatMessage', msg);

    socket.emit('clientToServerMessage', msg.val());

    //Clear input
    msg.val('');
    if ($(window).width() >= 576)
        msg.focus();
});
//**********************************
//Chat Send END
//**********************************