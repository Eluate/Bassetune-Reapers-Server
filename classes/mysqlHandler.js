//mysql and credentials + encryption deps
//note: credentials and password for encryption should be put in a read-only file, xml, json or text.
var mysql = require('mysql');

var crypto = require('crypto'),
  algorithm = 'aes-256-ctr',//needs to be unhardcoded
  password = 'K4n8g29WUV6977Yf';//needs to be unhardcoded

var connection = mysql.createConnection(
  {
    host: 'db-prototype002.cwifk3vfe6px.us-east-1.rds.amazonaws.com',
    user: 'brMaster',
    password: 'BrMaster1',
    database: 'brPrototype001'
  }, {debug: true});

connection.connect(function (err) {
  if (err) {
    //console.error('error connecting: ' + err.stack);
    return;
  }

  //console.log('connected as id ' + connection.threadId);
});
//helper functions
function hexToString(hex) {
  var bytes = [],
    str;

  for (var i = 0; i < hex.length - 1; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }

  str = String.fromCharCode.apply(String, bytes);
  return str;
}


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
  }
  catch (e) {
    //console.log("decipher fail");
    //console.log(e);
    return;
  }
}

var encrypt = function (text) {
  //console.log("type of text : ");
  //console.log(typeof text);
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

module.exports.connection = connection;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;