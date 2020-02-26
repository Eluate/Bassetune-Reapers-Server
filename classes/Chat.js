/*
 Simple chat system
 */
var Event = require('./EventEnum');

var Chat = function (self) {
    this.addMsg = function (players, player, msg, target) {
        var entry = {
            id: player.sID,
            msg: msg,
            t: target
        };

        for (var i = 0; i < players.length; i++) {
            var tPlayer = players[i];
            if (tPlayer.side == player.side && target == "F") {
                self.io.to(tPlayer.socketID).emit(Event.output.NEW_CHAT_MSG, entry);
            } else if (target == "A") {
                self.io.to(tPlayer.socketID).emit(Event.output.NEW_CHAT_MSG, entry);
            }
        }
    }
};

module.exports = Chat;