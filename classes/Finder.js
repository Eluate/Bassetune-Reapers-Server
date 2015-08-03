/**
 * Class for getting certain data
 */
var finder =  {
  GetUsernameFromSocketID: function(players, socketID) {
    var username = "";
    players.forEach(function(player) {
      if (player.socketID == socketID) {
        username = username;
      }
    });
    return username;
  },
  GetUsernameFromAccountID: function(players, accountID) {
    var username = "";
    players.forEach(function(player) {
      if (player.account_id == accountID) {
        username = username;
      }
    });
    return username;
  }
};

module.exports = finder;
