var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var app = express();

var cookie = '$cookie'
var token = '$token'

var lat;
var lon;

function go(callback) {

        request({
                url: 'https://www.yikyak.com/api/proxy/v1/messages/all/new?userLat='+lat+'&userLong='+lon+'&lat='+lat+'&long='+lon+'&myHerd=0',
                headers: {
                        'x-access-token': token,
                        'Referer': 'https://www.yikyak.com/nearby/new',
                        'Cookie': cookie
                }
        }, callback)
}

go(function print (error, response, body) {
    if (!error){
        console.log(body);
    }
})

app.use(bodyParser.json()   );  // support JSON encoded bodies
app.use(bodyParser.urlencoded({ // support URL encoded bodies
    extended: true
}));

app.get("/get", function (req, res, next) {

        go(function (err, results) {
                if (err) {
                        console.log("ERROR",err);
                };

                res.setHeader("Access-Control-Allow-Origin", "*");

                res.send(JSON.parse(results.body))
        }.bind(this))
});

app.post("/submitCoords", function(req, res) {
    lat = req.body.lat;
    lon = req.body.lon;
});

app.listen(80);