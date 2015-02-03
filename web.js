
var debug = require('debug')('searcher');
var app = require('./app');

app.set('port', process.env.PORT || 3000);

var http = require("http").Server(app);



var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
/*
var io = require("socket.io")(server);
if(io) console.log("socket io running " + io.port);

io.on('connection', function (socket) {
  console.log("connection");
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  console.log(clientIp + " just connected.")
  socket.emit('ok');

  socket.on('event1', function (data) {
    console.log(data);
  });

  socket.on('event2', function (data) {
    console.log(data);
  });
});
*/




