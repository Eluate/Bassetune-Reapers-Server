/*
 Class that handles the MySQL connection to the database
 */

var mysql = require('mysql');

// Connection settings
var connection = mysql.createPool(
  {
    host :'db-prototype002.cwifk3vfe6px.us-east-1.rds.amazonaws.com',
    user : 'brMaster',
    password: 'BrMaster1',
    database : 'brPrototype001'
  });

connection.getConnection(function (err, connection) {
  // Use the connection again on error
  if (err) throw err;
  connection.release();
});

module.exports.connection = connection;