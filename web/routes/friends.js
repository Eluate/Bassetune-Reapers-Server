var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
    // 1MB body limit
    if (req.body.length > 1e6) {
        // Flood attack or faulty client. Destroy request.
        req.connection.destroy();
    }
});

module.exports = router;