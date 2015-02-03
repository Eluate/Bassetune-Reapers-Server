var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var games = require('./routes/games');

var app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

function checkAuth(req, res, next)
{
    //check if user is logged in (check req.checkOK)
    //if yes then next
    console.log("checkAuth called");
    next(); 
}


app.use('/', routes);
app.use('/login', login);
app.use('/users',checkAuth, users);
app.use('/games',checkAuth,games);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') 
{
    app.use(function(err, req, res, next) 
    {
        res.status(err.status || 500)
        .send('error');
        
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    .send('error');
});


module.exports = app;
