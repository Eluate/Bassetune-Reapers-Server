var mysqlHandler = require('../../global/MySQLHandler');

var Login = function (req, res, next) {
    var username = req.body.username.toString();
    var password = req.body.password.toString();
    if (!username || !password) {
        return;
    }
    password = password + username.toUpperCase(); // Use username as salt

    // Query database for username and password combo
    mysqlHandler.connection.query("SELECT * FROM br_account WHERE username = ?", [username], function (err, results) //
    {
        if (results && results.length > 0 && mysqlHandler.hashPassword(password) == results[0].password) {
            // Sign in succeeded, gather data from secondary table
            mysqlHandler.connection.query("SELECT * FROM br_player WHERE account_id = ?", [results[0].account_id], function (err, player_results) //
            {
                req.userData = Object.assign(results[0], player_results[0]);
                next();
            });
        } else {
            res.send("error");
        }
    });
};

module.exports = Login;