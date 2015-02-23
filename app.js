var cluster = require('cluster');

if(cluster.isMaster) 
{
    var express = require('express');
    //master should communicate with face instances using http on startPort
    var startPort = process.env.PORT || 3000;//startPort is reserved for http server to communicate with backendFace
    
    var redisClient = require('./modules/redisHandler').redisClient;
    redisClient.incr('numGameInstances');
    
    
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    var workers = {};
    

    var app = express();
    
    app.set('port', startPort );
    
    var http = require("http").Server(app);
    var server;
    redisClient.get('numGameInstances').then(function (value) 
    {
            app.ID = value;
            server = app.listen(app.get('port'), function() 
        {
            console.log('master game server listening on address ' + server.address().address + ' and port ' + server.address().port);
            init();
        
        });
    });
     
    var init = function()
    {
        //cluster starts with 0 games
        
        var address = server.address().address;      
        var ipObject = {};
        ipObject["ip"] = address;
        ipObject["totalgames"] = 0;
        //create worker for cpu and add it to the list of workers with its port
        for(var i = 1; i< cpuCount+1; i += 1)
        {
            var nport = server.address().port + i;
            var w = cluster.fork({newPort: nport});
            var workerHandler = {worker : w , port : nport};
            workers[w.id] = workerHandler;
            ipObject[w.id] = nport;
        }
        redisClient.multi();
        redisClient.hmset(app.ID,ipObject);
        redisClient.sadd("backendGameInstances",app.ID);
        redisClient.exec();
        console.log(app.ID);
    };

    

    // Listen for dying workers
    cluster.on('exit', function (worker) 
    {
        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        //some code to respawn the new worker with the same port and update redis
        workers[worker.id] = undefined;
        //make new worker
        //cluster.fork();
        
    });
}
else//worker
{
var redisClient = require('./modules/redisHandler').redisClient;

var app = require('express')();
app.set('port', process.env.newPort );
var http = require("http").Server(app);
console.log("newPort : " + process.env.newPort );
var server = app.listen(app.get('port'), function() 
{
  console.log('Worker Game Express server listening on address : ' + server.address().address + ' on port ' + server.address().port);
  
});

var io = require("socket.io").listen(server);

if(io) console.log("socket io running and accepting connections.");

io.on('connection', function (socket) 
{
    console.log("connection");
    var socketId = socket.id;
    var clientIp = socket.request.connection.remoteAddress;
    console.log(cluster.worker.id + ' : ' + clientIp + " just connected.")
    socket.emit('ok');

    socket.on('event1', function (data) 
    {
        console.log(data);
    });
    //etc
});

}







module.exports = app;
