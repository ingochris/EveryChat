var express = require('express');
var zlib = require('zlib');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nunjucks = require('nunjucks');

var bodyParser = require('body-parser');
var request = require('request');

var cookie = '__cfduid=d206d66fb1528ae4f3fdf89f92b1b43b21453534817; yid=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiI1MDZFMkVFQS1BNkFCLTRDM0YtOTNBNi03Q0RCQzQwNUU4MjEiLCJpYXQiOjE0NTM1ODA3ODYsImV4cCI6MTQ1MzU4MjU4NiwiaXNzIjoieWlreWFrLmNvbSIsInN1YiI6InNwaWRlcnlhayJ9.nOttcIiP3shWULaktL7P80eAJd8bl6g3y0e0eVQIhkk; rm=true';
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiI1MDZFMkVFQS1BNkFCLTRDM0YtOTNBNi03Q0RCQzQwNUU4MjEiLCJpYXQiOjE0NTM1ODA3ODYsImV4cCI6MTQ1MzU4MjU4NiwiaXNzIjoieWlreWFrLmNvbSIsInN1YiI6InNwaWRlcnlhayJ9.nOttcIiP3shWULaktL7P80eAJd8bl6g3y0e0eVQIhkk';
// curl "https://yikyak.com/api/proxy/v1/messages/all/new?userLat=39.951603899999995&userLong=-75.1910723&lat=39.951603899999995&long=-75.1910723&myHerd=0"
// -H "Accept-Encoding: gzip, deflate, sdch"
// -H "Accept-Language: en-US,en;q=0.8"
// -H "User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36"
// -H "Accept: application/json, text/plain, */*"
// -H "Referer: https://yikyak.com/nearby/new"
// -H "Cookie: __cfduid=d206d66fb1528ae4f3fdf89f92b1b43b21453534817; yid=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiI1MDZFMkVFQS1BNkFCLTRDM0YtOTNBNi03Q0RCQzQwNUU4MjEiLCJpYXQiOjE0NTM1NzUzNjksImV4cCI6MTQ1MzU3NzE2OSwiaXNzIjoieWlreWFrLmNvbSIsInN1YiI6InNwaWRlcnlhayJ9.i9mQjuGXLJtlF--Z2F8swZkKZY4zDSo1i6a-Wd_3QqY; rm=true"
// -H "Connection: keep-alive"
// -H "x-access-token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiI1MDZFMkVFQS1BNkFCLTRDM0YtOTNBNi03Q0RCQzQwNUU4MjEiLCJpYXQiOjE0NTM1NzUzNjksImV4cCI6MTQ1MzU3NzE2OSwiaXNzIjoieWlreWFrLmNvbSIsInN1YiI6InNwaWRlcnlhayJ9.i9mQjuGXLJtlF--Z2F8swZkKZY4zDSo1i6a-Wd_3QqY"
// -H "Cache-Control: max-age=0" --compressed
var lat;
var lon;
var socket_data = {};


nunjucks.configure('templates', {
    autoescape: true,
    express: app
});

app.use(express.static('public'));


app.get('/', function(req, res){
    res.render('index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket) {
    console.log("connection");
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    });
    socket.on('local message', function(msg) {
        var zipcode = socket_data[socket.id].zipcode;
        console.log(socket_data);

        console.log('dank as fuck: ' + msg);
        socket.broadcast.to(zipcode).emit('local message', msg);
    });


    socket.on('IDENTIFY', function(msg) {
        socket_data[socket.id] = {};
        socket_data[socket.id].zipcode = msg.zip;
        socket.join(msg.zip);

        console.log(msg.lat);
        console.log(msg.lon);
        console.log(msg.zip);
    });
});


function go(callback) {
    // console.log(cookie);
    // console.log(token);
    console.log(lat);
    console.log(lon);
    request({
            url: 'https://www.yikyak.com/api/proxy/v1/messages/all/new?userLat='+lat+'&userLong='+lon+'&lat='+lat+'&long='+lon+'&myHerd=0',
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
// -H "Cookie: __cfduid=d206d66fb1528ae4f3fdf89f92b1b43b21453534817; yid=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiI1MDZFMkVFQS1BNkFCLTRDM0YtOTNBNi03Q0RCQzQwNUU4MjEiLCJpYXQiOjE0NTM1NTk5NjUsImV4cCI6MTQ1MzU2MTc2NSwiaXNzIjoieWlreWFrLmNvbSIsInN1YiI6InNwaWRlcnlhayJ9.9AvyllCHKkcZe4Jvdw9S_HdeHSfioKtJlUmu02WV0_E; rm=true"
// -H "Connection: keep-alive"
// -H "x-access-token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiI1MDZFMkVFQS1BNkFCLTRDM0YtOTNBNi03Q0RCQzQwNUU4MjEiLCJpYXQiOjE0NTM1NTk5NjUsImV4cCI6MTQ1MzU2MTc2NSwiaXNzIjoieWlreWFrLmNvbSIsInN1YiI6InNwaWRlcnlhayJ9.9AvyllCHKkcZe4Jvdw9S_HdeHSfioKtJlUmu02WV0_E" --compressed

app.use(bodyParser.json()   );  // support JSON encoded bodies
app.use(bodyParser.urlencoded({ // support URL encoded bodies
    extended: true
}));

app.get("/get", function (req, res, next) {
    go(function(err, results) {
        if (err) {
            console.log("ERROR", err);
        }

        res.setHeader("Access-Control-Allow-Origin", "*");

        res.send(JSON.parse(results.body));
    }.bind(this));

});

app.post("/submitCoords", function(req, res) {
    lat = req.body.lat;
    lon = req.body.lon;
    go(function print(error, response, body) {
        // console.log(request.url);

        //console.log(error);
        //console.log(response);
        if (!error) {
            console.log(body);
        }
    });

});
