var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var nunjucks = require('nunjucks');

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

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});
