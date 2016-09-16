/*
 Simple chat system
 */
var Event = require('./EventEnum');

var Chat = function (io, room) {
  this.addMsg = function (players, player, msg, target) {
    var entry = {
      id: player.sID,
      msg: msg.toString()
    };
    
    for (var i = 0; players.length; i++) {
      var tPlayer = players[i];
      if (tPlayer.side == player.side && target == "F") {
        io.to(tPlayer.socketID).emit(Event.output.NEW_CHAT_MSG, entry);
      }
      else if (target == "A") {
        io.to(tPlayer.socketID).emit(Event.output.NEW_CHAT_MSG, entry);
      }
    }
  }
};

module.exports = Chat;