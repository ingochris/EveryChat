const A_MAX_MSGS = 40;
const A_NUNJUCK_TEMPLATE = `
{% for m in messages %}
<p><b style='color:{{m.color}}'>{{m.username}}</b>: {{m.text | safe}}</p>
{% endfor %}
`;

var socket = io(window.location.href[-1]);
var color = getRandomColor();
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var Message = Backbone.Model.extend({
    initialize: function() {
        // this.on("change", function () {
        //     this.updateChatArea();
        //     console.log('stuff changed');
        // });
    },
    addMessage: function(username, messageText, color, escapeText) {
      if (!escapeText) {
        messageText = nunjucks.renderString("{{esc | escape}}", {esc: messageText});

      }
      console.log(escapeText);
        var messages = this.get('messages');
        if (typeof messages == "undefined") {
            messages = [];
        }
        console.log(messageText);
        messages.push({username: username, text: messageText, color: color});
        this.set('messages', messages);
        this.updateChatArea();
    },
    updateChatArea: function() {
        var messages = this.get('messages');

        var markup = nunjucks.renderString(A_NUNJUCK_TEMPLATE, {
            messages: messages
        });

        $('#content-chat').html(markup);
        this.chatMaint();
    },
    chatMaint: function() {
        var messages = this.get('messages');
        if (messages.length > A_MAX_MSGS) {
            messages.shift();
        }
        this.set('messages', messages);
    }

});

window.messages = new Message();


socket.on('local message', function(data) {
    messages.addMessage("Anonymous", data.msg, data.color);
});

socket.on('yik yak', function(data) {

    messages.addMessage("YikYak", "Message: " + data );

    /*
      Desired format:
      Title: data.title
      Comments: data.comment
      Posted by: data.poster_name
     */

});

socket.on('every block', function(data) {
    var message_markup = nunjucks.renderString(`
      <p>Title: {{data.title}}</p>
      {% if data.comment %}
      <p>Comment: {{data.comment}}</p>
      {% endif %}
     {% if data.user %}
     <p>Posted By: {{data.user}}</p>
     {% endif %}
      `, {data:data})
    messages.addMessage("EveryBlock Updates", message_markup, "black", true);


    /*
      Desired format:
      Title: data.title
      Comments: data.comment
      Posted by: data.poster_name
     */

});

function sendMessage(msg) {
    socket.emit('local message', {msg: msg, color: color});
    messages.addMessage("Me", msg, "black");
    console.log("message sent!");

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        window.alert("Geolocation is not supported by this browser.");
    }
}

getLocation();

function showPosition(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    codeLatLng(lat, lng, function (data) {
        var whole_addr = data[8].formatted_address;
        var zipcode = data[8].address_components[6].short_name;
        console.log(zipcode);
        $('#zipcode').text(zipcode);

        $('#waddr').text(whole_addr);

        var dt = { lat: lat, lon: lng, zip: zipcode, color: color };
        socket.emit('IDENTIFY', dt);
    });
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


var geocoder;

function initialize() {
    geocoder = new google.maps.Geocoder();
}


function codeLatLng(lat, lng, fn) {
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({
        'latLng': latlng
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[3]) {
                var rgc = results;
                console.log(results);
                fn(rgc);
            }
        } else {
            console.log("Geocoder failed due to: " + status);
        }
    });
}
$(initialize);

$('#chatInput').keypress(function(e) {
    if (e.which == 13) {
        sendMessage($('#chatInput').val());
        $('#chatInput').val('');
        return false;
    }
});

$('.btn-blue').on('click', function(e) {
    e.preventDefault();

    sendMessage($('#chatInput').val());
    $('#chatInput').val('');
    return false;
})
