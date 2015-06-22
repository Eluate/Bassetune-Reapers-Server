/*
 Simple chat system
 */
var Event = require('./EventEnum');

var Chat = function (io, room) {
  this.addMsg = function (player, msg) {
    var entry = {
      username: player.username,
      msg: msg
    };
    //this.stack.push(entry);
    io.to(room).emit(Event.output.NEW_CHAT_MSG, entry);
  }
};

module.exports = Chat;