const A_MAX_MSGS = 20;
const A_NUNJUCK_TEMPLATE = `
{% for m in messages %}
<p><b>{{m.username}}</b>: {{m.text}}</p>
{% endfor %}
`;

var socket = io(window.location.href[-1]);

var Message = Backbone.Model.extend({
    initialize: function() {
        // this.on("change", function () {
        //     this.updateChatArea();
        //     console.log('stuff changed');
        // });
    },
    addMessage: function(username, messageText) {
        var messages = this.get('messages');
        if (typeof messages == "undefined") {
            messages = [];
        }
        messages.push({username: username, text: messageText});
        this.set('messages', messages);
        this.updateChatArea();
    },
    updateChatArea: function() {
        var messages = this.get('messages');
        var markup = nunjucks.renderString(A_NUNJUCK_TEMPLATE, { messages: messages });

        $('#content-chat').html(markup);
        console.log(messages);
        console.log('updating chat area and shit');
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

socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});

socket.on('local message', function(data) {
    console.log(data);
    messages.addMessage("Anonymous", data);
});

function sendMessage(msg) {
    socket.emit('local message', msg);
    messages.addMessage("Me", msg);
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

        var dt = { lat: lat, lon: lng, zip: zipcode };
        socket.emit('IDENTIFY', dt);

    });

}


var geocoder;
function initialize() {
    geocoder = new google.maps.Geocoder();
}
function codeLatLng(lat, lng, fn) {
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[3]) {
                var rgc = results;
                fn(rgc);
            }
        } else {
            console.log("Geocoder failed due to: " + status);
        }
    });
}
$(initialize);

$('#chatInput').keypress(function (e) {
    if (e.which == 13) {
        sendMessage($('#chatInput').val());
        $('#chatInput').val('');
        return false;
    }
});
