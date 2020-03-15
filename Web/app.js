/*
 Main class for server management
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var routes = {
    indexRoute: require('./routes/Index'),
    usersRoute: require('./routes/Users'),
    loginRoute: require('./routes/SignIn'),
    registerRoute: require('./routes/Register'),
    gamesRoute: require('./routes/Games'),
    inventoryRoute: require('./routes/Inventory'),
    slotsRoute: require('./routes/Slots'),
};

var modules = {
    checkAuth: require('./modules/AuthenticationChecker'),
    loadUserData: require('./modules/LoadUserData'),
    getInventory: require('./modules/GetInventory'),
    setInventory: require('./modules/Shop_Items'),
    appExitHandler: require('./modules/AppExitHandler').cleanup()
};

app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: true}));

// Activate Routes
app.get('/', routes.indexRoute);
app.post('/login', routes.loginRoute, modules.loadUserData);
app.post('/register', routes.registerRoute);
app.post('/users', modules.checkAuth, routes.usersRoute);
app.post('/games', modules.checkAuth, routes.gamesRoute);
app.post('/getInventory', modules.checkAuth, modules.getInventory, routes.inventoryRoute);
app.post('/setInventory', modules.checkAuth, modules.setInventory);
app.post('/slots', modules.checkAuth, routes.slotsRoute);

// Catch 404 Errors
app.use(function (req, res, next) {
    res.status(404).end();
});

// Development error handler (Prints stack trace)
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500).send("error");
        console.log(err);
    });
}
// Production error handler (No stack trace printed)
else {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500).send('error');
    });
}

app.set('port', process.env.PORT || 3000);
var http = require("http").createServer(app);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});


module.exports = app;