/**
 * Class for getting certain data
 */
var finder =  {
  GetUsername: function(players, socketID) {
    var username = "";
    players.forEach(function(player) {
      if (players.socketID == socketID) {
        username = username;
      }
    });
    return username;
  }
};

module.exports = finder;
