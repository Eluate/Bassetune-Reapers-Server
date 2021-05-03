const mysql = require('mysql');
const config = require('config');

// Connection settings
var sqlConfig = config.get('MySql');
var connection = mysql.createPool({
    host: sqlConfig.get("host"),
    port: sqlConfig.get("port"),
    user: process.env.SQL_USER,
    password: process.env.SQL_PW,
    database: sqlConfig.get("database")
});

connection.getConnection(function (error, connection) {
    // Use the connection again on error
    if (error) console.error("SQL Error: " + error);
    if (connection) connection.release();
});

module.exports.connection = connection;