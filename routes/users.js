var express = require('express');
var router = express.Router();

/* GET users listing. */
//this route only execs if logged in, must add check
router.param('user', function (req, res, next, id) {

  //find user in database and set req.user
  req.user = id;
  next();
});

router.get('/', function (req, res) {
  res.send('unautorized.');
});

router.get('/:user', function (req, res) {
  //this will respond with a json object containing the user data
  //fetch data in database
  //and send back
  res.send('user : ' + req.user);
});

module.exports = router;
