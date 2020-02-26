var redisClient = require('./redisHandler').redisClient;


function killConnections() {

    redisClient.quit(function (error) {
        if (error) console.log(error);
        console.log("redis success disconnection.");
    });
    //process.exit(0);
    //console.log(mysqlConnection);
    //console.log(redisClient);
}

var cleanup = function (callback) {

    // attach user callback to the process event emitter
    // if no callback, it will still exit gracefully on Ctrl-C
    callback = callback || killConnections;
    process.on('cleanup', callback);

    // do app specific cleaning before exiting
    process.on('exit', function () {
        process.emit('cleanup');
    });

    // catch ctrl+c event and exit normally
    process.on('SIGINT', function () {
        console.log('Ctrl-C...');
        //callback();
        process.exit(2);
    });

    //catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', function (e) {
        //killConnections();
        console.log('Uncaught Exception...');
        console.log(e.stack);
        process.exit(99);
    });
};

module.exports.cleanup = cleanup;