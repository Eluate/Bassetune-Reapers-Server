var mysqlHandler = require('../../global/MySQLHandler');
var dateFormatter = require('../modules/DateFormatter').toMysqlFormat;
// Regex used for checking if usernames and nicknames are valid
var alphanumericRegex = new RegExp("^[a-zA-Z0-9]+$");

var Register = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var nickname = req.body.nickname;
    var email = req.body.email;
    var bDayY = req.body.BdayY;
    var bDayM = req.body.BdayM;
    var bDayD = req.body.BdayD;
    if (isNaN(parseInt(bDayM)) || isNaN(parseInt(bDayD)) || isNaN(parseInt(bDayY))) {
        return;
    }
    var bDay = dateFormatter(new Date(bDayY, bDayM, bDayD)); // Convert given date to the MySQL format
    var registrationDate = dateFormatter(new Date()); // Convert given date to the MySQL format

    //TODO: Add email verifier
    //TODO: Possible add captcha

    // Verify Given Details (Nickname and username must be alphanumeric only)
    if (username && username.match(alphanumericRegex) && password && nickname && nickname.match(alphanumericRegex) && email) {
        // All details are fine
    } else {
        return;
    }

    // Hash password
    password = mysqlHandler.hashPassword(password + username.toUpperCase()); // Using username capitalised as a salt

    // Insert registration values into table
    mysqlHandler.connection.query("INSERT INTO br_account (username, nickname, password, email, date_of_birth, date_of_registration) VALUES (?, ?, ?, ?, ?, ?)",
        [username, nickname, password, email, bDay, registrationDate], function (error, success) {
            if (error) {
                //console.log(error);
                res.send("An error occurred: " + error.stack);
            } else {
                res.send("Registration Succeeded.");
                // Enter an entry into the table containing its inventory
                /*mysqlHandler.connection.query("INSERT INTO br_inventory (account_id) VALUES (?)", [success.insertId], function (err, succ) {
                  // Inserted Row
                });*/
                // Enter an entry into the table for the player data
                mysqlHandler.connection.query("INSERT INTO br_player (account_id) VALUES (?)", [success.insertId], function (err, succ) {
                    // Inserted Row
                });
            }
        });
};

module.exports = Register;