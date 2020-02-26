/*
 Class that handles the MySQL connection to the database
 */

var mysql = require('mysql');

// Connection settings
var connection = mysql.createPool(
    {
        host: '127.0.0.1',
        port: 3306,
        user: 'Static',
        password: 'BRPrototype101',
        database: 'brprototype001',
        acquireTimeout: 30000,
        connectTimeout: 40000
    });

connection.getConnection(function (err, connection) {
    // Use the connection again on error
    if (err) throw err;
    if (connection) connection.release();
});

module.exports.connection = connection;