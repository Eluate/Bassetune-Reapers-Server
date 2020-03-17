/*
 Class that handles the MySQL connection to the database
 */

const mysql = require('mysql');
const config = require('config');

// Connection settings
var connection = mysql.createPool(config.get('MySql'));

connection.getConnection(function (err, connection) {
    // Use the connection again on error
    if (err) throw err;
    if (connection) connection.release();
});

module.exports.connection = connection;