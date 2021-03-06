var express = require('express');
var zlib = require('zlib');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nunjucks = require('nunjucks');

var bodyParser = require('body-parser');
var request = require('request');

var everyblock = [];
var everyIndex = 0;
var id = 0;

var yikyak = [];
var yikIndex = 0;


var cookie = "$cookie"
var token = "$token"
var lat;
var lon;
var socket_data = {};

app.use(express.static('public'));
app.use(bodyParser.json()); // support JSON encoded bodies
app.use(bodyParser.urlencoded({ // support URL encoded bodies
    extended: true
}));


nunjucks.configure('templates', {
    autoescape: true,
    express: app
});


app.get('/', function(req, res) {
    res.render('index.html');
});

io.on('connection', function(socket) {
    console.log("connection");
    socket.on('local message', function(msg) {
        //var zipcode = socket_data[socket.id].zipcode;
        console.log(socket_data);

        socket.broadcast.emit('local message', msg);
    });


    socket.on('IDENTIFY', function(msg) {
        socket_data[socket.id] = {};
        socket_data[socket.id].zipcode = msg.zip;
        socket.join(msg.zip);

        lat = msg.lat;
        lon = msg.lon;
        console.log(msg.lat);
        console.log(msg.lon);
        console.log(msg.zip);


        pollYikYak();
        setInterval(pollYikYak, 10000);

        setInterval(sendYikYak, 60000);


        // go(function print(error, response, body) {
        //     if (!error) {
        //         console.log(body);
        //     }
        // });
    });
});


function go(callback) {
  console.log( "Your cookie: " + cookie );
  console.log( "Your token: " + token );
  console.log( "Your latitude: " + lat );
  console.log( "Your longitude: " + lon );
    request({
        url: 'https://www.yikyak.com/api/proxy/v1/messages/all/new?userLat=' + lat + '&userLong=' + lon + '&lat=' + lat + '&long=' + lon + '&myHerd=0',
        //url: 'https://yikyak.com/api/proxy/v1/messages/all/new?userLat=39.951603899999995&userLong=-75.1910723&lat=39.951603899999995&long=-75.1910723&myHerd=0',
        gzip: true,
        headers: {
            'x-access-token': token,
            'Referer': 'https://www.yikyak.com/nearby/new',
            'Cookie': cookie,
            'Accept-Encoding': 'gzip, deflate, sdch',
            'Accept-Language': 'en-US,en;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://yikyak.com/nearby/new',
            'Connection': 'keep-alive',
        }
    }, callback);
}

// curl "https://yikyak.com/api/proxy/v1/messages/all/new?userLat=39.9516862&userLong=-75.1911792&lat=39.9516862&long=-75.1911792&myHerd=0" -H
// "Accept-Encoding: gzip, deflate, sdch" -H
// "Accept-Language: en-US,en;q=0.8" -H
// "User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36" -H
// "Accept: application/json, text/plain, */*"
// -H "Referer: https://yikyak.com/nearby/new"
// -H "Cookie: cookie
// -H "Connection: keep-alive"
// -H "x-access-token: token +" --compressed"

app.get("/get", function(req, res, next) {
    go(function(err, results) {
        if (err) {
            console.log("ERROR", err);
        }

        res.setHeader("Access-Control-Allow-Origin", "*");

        res.send(JSON.parse(results.body));
    }.bind(this));

});

function pollYikYak() {
    var newYikYak = [];

    request({
        url: 'https://www.yikyak.com/api/proxy/v1/messages/all/new?userLat=' + lat + '&userLong=' + lon + '&lat=' + lat + '&long=' + lon + '&myHerd=0',
        gzip: true,
        headers: {
            'x-access-token': token,
            'Referer': 'https://www.yikyak.com/nearby/new',
            'Cookie': cookie,
            'Accept-Encoding': 'gzip, deflate, sdch',
            'Accept-Language': 'en-US,en;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://yikyak.com/nearby/new',
            'Connection': 'keep-alive',
        }
    }, function(error, response, body) {
        if (!error) {
            for ( i = 0; i < 25; i++ ){
                newYikYak.push(JSON.parse(body)[i].message);

                newYikYak.forEach(function(val, index) {
                    if (!containsObject(val, yikyak)) {
                        yikyak.push(val);
                    }
                });

            }

        }
    })
}

function sendYikYak() {
    if (yikIndex < yikyak.length) {
        io.sockets.emit('yik yak', yikyak[yikIndex]);
        yikIndex++;
    }
}



function pollEveryBlock() {
    var newEveryblock = [];

    request('https://api.everyblock.com/content/philly/locations/19104/timeline/?token=d57c38793098b0e9a92adee4ee9ca7b20a8fb036', function(error, response, body) {
        if (!error && response.statusCode == 200) {

            body = JSON.parse(body);
            var results = body.results;
            var step;

            for (step = 0; step < 25; step++) {
                var title = results[step].title;
                var comment;
                // if (results[step].attributes.comment != undefined) {
                //     comment = ;
                // } else {
                //     comment = ;
                // }
                comment = results[step].attributes.comment || results[step].attributes.excerpt || results[step].location_name;

                var latitude = results[step].location_coordinates[0].latitude;
                var longitude = results[step].location_coordinates[0].longitude;
                var location = results[step].location_name;
                var date = results[step].pub_date;
                var user;
                if (typeof results[step].poster_name != "undefined") {
                  user = results[step].poster_name;
                } else {
                  user = results[step].provider_name;
                }
                user = results[step].poster_name || results[step].provider_name;

                newEveryblock.push({
                    title: title,
                    comment: comment,
                    latitude: latitude,
                    longitude: longitude,
                    location: location,
                    date: date,
                    user: user
                });
            }


            newEveryblock.forEach(function(val, index) {
                if (!containsObject(val, everyblock)) {
                    everyblock.push(val);
                }
            });

        }
    })
}

pollEveryBlock();
setInterval(pollEveryBlock, 10000);

function sendEveryBlock() {
    if (everyIndex < everyblock.length) {
        io.sockets.emit('every block', everyblock[everyIndex]);
        everyIndex++;
    }
}
setInterval(sendEveryBlock, 15000);

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}




http.listen(3000, function() {
    console.log('listening on *:3000');
});
