var express = require('express');
var router = express.Router();

//this route only execs if logged in, must add check

router.post('/', function (req, res) {
    res.send('users route.');
});

module.exports = router;
