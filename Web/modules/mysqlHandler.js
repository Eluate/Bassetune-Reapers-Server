/*
 Class that handles the MySQL connection and encryption/decryption dependencies
 */

var mysql = require('mysql');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',//needs to be unhardcoded
    password = 'K4n8g29WUV6977Yf';//needs to be unhardcoded

// Connection settings
var connection = mysql.createPool(
    {
        host: 'mainbr.czcedyst2rii.us-west-2.rds.amazonaws.com',
        port: 3306,
        user: 'Static',
        password: 'BRPrototype101',
        database: 'brprototype001',
        connectTimeout: 40000
    });

connection.getConnection(function (err, connection) {
    // Use the connection again on error
    if (err) throw err;
    if (connection) connection.release();
});

// Convert Hex to String Method
var hexToString = function (hex) {
    var bytes = [],
        str;

    for (var i = 0; i < hex.length - 1; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }

    str = String.fromCharCode.apply(String, bytes);
    return str;
};

// Decrypt Method
var decrypt = function (text) {
    //console.log("type of text : ");
    //console.log(typeof text);
    text = hexToString(text);
    try {
        var decipher = crypto.createDecipher(algorithm, password);
        var dec = decipher.update(text, 'string', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    } catch (e) {
        //console.log("decipher fail");
        //console.log(e);

    }
};

// Encrypt Method
var encrypt = function (text) {
    //console.log("type of text : ");
    //console.log(typeof text);
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

module.exports.connection = connection;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;