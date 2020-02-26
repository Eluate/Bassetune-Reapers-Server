var express = require('express');
var router = express.Router();

/* GET users listing. */
//this route only execs if logged in, must add check
router.param('loginID', function (req, res, next, loginID) {
    /*
     find user in database
     if existant, set req.login to loginID
     */

    req.loginID = loginID;
    next();
});

router.param('password', function (req, res, next, pass) {

    //security: pswrds will need to be decrypted here , then crosschecked with loginID in the database, if ok, next, else send back error


    req.password = pass;
    //req.checkOK = result of check call to db
    next();
});


router.get('/', function (req, res) {
    res.send('unautorized.');
});

router.get('/:loginID/:password', function (req, res) {
    //check if req.checkOK is defined and is holding a true value , if yes validate the login and add user to list of connected clients
    //session data needs to be stored in redis or the like to be available to all the app instances
    res.send('loginID : ' + req.loginID + ' password : ' + req.password);
});

module.exports = router;
