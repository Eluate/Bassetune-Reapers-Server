var redisClient = require('./redisHandler').redisClient;

function killConnections() {
    redisClient.quit(function (error) {
        if (error) console.error(error);
        console.log('Disconnected from Redis');
    });
}

var cleanup = function (callback) {
    // attach user callback to the process event emitter
    // if no callback, it will still exit gracefully on Ctrl-C
    callback = callback || killConnections;
    process.on('cleanup', callback);

    // do app specific cleaning before exiting
    process.on('exit', () => process.emit('cleanup'));

    // catch ctrl+c event and exit normally
    process.on('SIGINT', function () {
        console.log('Ctrl-C...');
        killConnections();
        process.exit(2);
    });

    //catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', function (e) {
        console.error('Uncaught Exception: ' + e);
        killConnections();
        process.exit(99);
    });
};

module.exports.cleanup = cleanup;