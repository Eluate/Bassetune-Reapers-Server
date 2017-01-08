/**
 * Class for getting certain data
 */
var finder =  {
  GetUsernameFromSocketID: function(players, socketID) {
    var username = "";
    players.forEach(function(player) {
      if (player.socketID == socketID) {
        username = player.username;
      }
    });
    return username;
  },
  GetUsernameFromAccountID: function(players, accountID) {
    var username = "";
    players.forEach(function(player) {
      if (player.account_id == accountID) {
        username = player.username;
      }
    });
    return username;
  },
  GetAccountIDFromSocketID: function(players, socketID) {
    var accountID = "";
    players.forEach(function (player) {
      if (player.socketID == socketID) {
        accountID = player.account_id;
      }
    });
    return accountID;
  },
  GetPlayerFromSocketID: function(players, accountID) {
    var playerObject = "";
    players.forEach(function(player) {
      if (player.socketID == accountID) {
        playerObject = player;
      }
    });
    return playerObject;
  },
	GetPlayerSIDFromSocketID: function(players, accountID) {
		var sID = "";
		players.forEach(function(player) {
			if (player.socketID == accountID) {
				sID = player.sID;
			}
		});
		return sID;
	},
  GetPlayerFromAccountID: function(players, accountID) {
    var playerObject = "";
    players.forEach(function(player) {
      if (player.account_id == accountID) {
        playerObject = player;
      }
    });
    return playerObject;
  },
  GetSocketFromPlayerSID: function(players, playerSID) {
    var socket = null;
    players.forEach(function (player) {
      if (player.sID == playerSID) {
        socket = player.socket;
      }
    });
    return socket;
  }
};

module.exports = finder;
