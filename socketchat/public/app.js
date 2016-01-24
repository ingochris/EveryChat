var socket = io(window.location.href[-1]);
    socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
});


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
