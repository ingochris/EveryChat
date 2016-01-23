var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var app = express();

var cookie = '__cfduid=d206d66fb1528ae4f3fdf89f92b1b43b21453534817; yid=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiI1MDZFMkVFQS1BNkFCLTRDM0YtOTNBNi03Q0RCQzQwNUU4MjEiLCJpYXQiOjE0NTM1NDA4OTEsImV4cCI6MTQ1MzU0MjY5MSwiaXNzIjoieWlreWFrLmNvbSIsInN1YiI6InNwaWRlcnlhayJ9.zxpZDlFUl13DZAtf5Pphlb7eGGacckqE1260gxRbcTM; rm=true'
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySUQiOiI1MDZFMkVFQS1BNkFCLTRDM0YtOTNBNi03Q0RCQzQwNUU4MjEiLCJpYXQiOjE0NTM1NDA4OTEsImV4cCI6MTQ1MzU0MjY5MSwiaXNzIjoieWlreWFrLmNvbSIsInN1YiI6InNwaWRlcnlhayJ9.zxpZDlFUl13DZAtf5Pphlb7eGGacckqE1260gxRbcTM'

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