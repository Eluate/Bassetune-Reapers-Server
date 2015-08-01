var Event = require('./EventEnum');
var Chat = require('./Chat');
var Location = require('./Location');
var Map = require('./Map');
var Event = require('./EventEnum');
var MySQLHandler = require('./mysqlHandler');

var Room = function (io, game_uuid, config) {
  // Start instances of modules
  var map = new Map();
  var chat = new Chat(io, game_uuid);
  var location = new Location(io, game_uuid, map);

  // All players that exist in the current game
  var players = [];
  // All characters
  var characters = [];

  /*
    Get player Data
   */
  var StorePlayerData = function (data) {
    // Get player data
    config.players.forEach(function (accountID) {
      mysqlHandler.connection.query("SELECT * FROM br_account WHERE account_id = ?" , [accountID] , function(err,results) {
        if (err) {
          return;
        }
        players.push(results[0]);
      });
    });
    // Sort boss data
    config.bosses.forEach(function(accountID) {
      MySQLHandler.connection.query("SELECT * FROM br_inventory WHERE account_id = ? AND false = isNull(item_id)", [accountID], function(err, results) {
        if (err) {
          return;
        }
        var allItems = [];
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_id.toString() != "null") {
            items.push(results[i]);
          }
        }
        // TODO: Filter bosses, minibosses, creatures, traps
      });
    });
    config.knights.forEach(function(accountID) {
      MySQLHandler.connection.query("SELECT * FROM br_inventory WHERE account_id = ?", [accountID], function(err, results) {
        var items = [];
        var weapons = [];
        var abilities = [];
        for (var i = 0; i < results.length; i++) {
          if (results[i].weapon_id.toString() != "null") {
            weapons.push(results[i]);
          } else if (results[i].item_id.toString() != "null") {
            items.push(results[i]);
          } else if (results[i].ability_id.toString() != "null") {
            items.push(results[i]);
          }
        }
        // TODO: Set inventory
      });
    });
    // TODO: Store player data
    players = data;
  };
  StorePlayerData(config);

  /*
   Handle Reconnection
   */
  socket.in(game_uuid).on('register', function (data) {
    if (!players.some(function (player) {
      if (data.uuid == player.last_uuid) {
        player.socketID = socket.id;
        return true;
      }return false;
    })) {
      socket.disconnect();
    }
    // emit registered
    // TODO: Emit data (Characters, Locations, Players)
  });

  /*
   Listeners: Input from the player
   */
  var StartListening = function () {
    // Disconnection
    socket.in(game_uuid).on('disconnect', function () {
      require('./Disconnect').disconnect(socket);
    });
    // Text Chat
    socket.in(game_uuid).on(Event.input.TALK, function (data) {
      players.forEach(function (player) {
        if (player.socketID == socket.id) {
          chat.addMsg(player.username, data.message);
        }
      });
    });
    // Movement
    socket.in(game_uuid).on(Event.input.MOVE, function (data) {
      for (var key in data) {
        if (isNaN(parseFloat(data[key][0])) || isNaN(parseFloat(data[key][1]))) {
          return;
        }
        characters.forEach(function (character) {
          if (character.id != key) {
            return;
          }
          // Check if channelling
          if (character.channelling) {
            if (character.channelling != false) {
              if (character.channelling == true) {
                character.channelling = "m";
              } else {
                character.channelling += "m";
              }
              character.channellingAbility.CheckInterruption();
            }
          }
          players.forEach(function (player) {
            if (player.socketID == socket.id && player.username == character.owner) {
              location.UpdateDestination(key, data[key]);
            }
          });
        });
      }
    });
    // Leave
    socket.in(game_uuid).on(Event.input.LEAVE, function () {
      io.sockets.connected[socket.id].disconnect();
    });
    // Knight changing equipped
    socket.in(game_uuid).on(Event.input.knight.CHANGE_EQUIPPED, function (data) {
      var characterID = parseInt(data.characterID, 10);
      if (!isNaN(characterID) && characterID < characters.length &&
        players[socket.id].username == characters[characterID].owner && characters[characterID].knight != null) {
        characters[characterID].knight.ChangeEquipped(data.itemID, data.target);
      }
    });
    // Knight using ability
    socket.in(game_uuid).on(Event.input.knight.ABILITY_START, function (data) {
      var abilityID = parseInt(data.abilityID, 10);
      var characterID = parseInt(data.characterID, 10);
      var weaponID = parseInt(data.weapon, 10);
      if (isNaN(abilityID) || isNaN(characterID) || isNaN(weaponID) || data.target == null ||
        !data.target.hasOwnProperty("x") || !data.target.hasOwnProperty("y")) {
        return;
      }
      characters.forEach(function (character) {
        if (character.id != characterID && character.type == "knight") {
          return;
        }
        players.forEach(function (player) {
          if (player.socketID == socket.id && player.username == character.owner) {
            if (!character.stunned && character.knight != null) {
              data.abilityID = abilityID;
              data.weaponID = weaponID;
              data.location = location;
              data.character = character;
              data.characters = characterID;
              data.game_uuid = game_uuid;
              data.io = io;
              character.knight.UseAbility(data);
            }
          }
        });
      });
    });
    // Knight using item
    socket.in(game_uuid).on(Event.input.knight.USE_ITEM_START, function (data) {
      var characterID = parseInt(data.characterID, 10);
      var itemID = parseInt(data.itemID, 10);
      if (isNaN(characterID) || isNaN(itemID)) {
        return;
      }
      characters.forEach(function (character) {
        if (character.id != characterID) {
          return;
        }
        players.forEach(function (player) {
          if (player.socketID == socket.id && player.username == character.owner) {
            if (!character.stunned && character.knight != null) {
              data.itemID = itemID;
              data.location = location;
              data.character = characters[characterID];
              data.characters = characters;
              data.game_uuid = game_uuid;
              data.io = io;
              character.knight.UseItem(data);
            }
          }
        });
      });
    });
    // Boss putting a trap down
    socket.in(game_uuid).on(Event.input.boss.PUT_TRAP, function (data) {
      // TODO: Put a trap
    });
    // Boss using an ability
    socket.in(game_uuid).on(Event.input.boss.ABILITY_START, function (data) {
      var abilityID = parseInt(data.abilityID, 10);
      var characterID = parseInt(data.characterID, 10);
      var target = data.target;
      if (isNaN(abilityID) || isNaN(characterID) || ((!target.hasOwnProperty("x") || !target.hasOwnProperty("y")) ||
      !target.hasOwnProperty("toggle"))) {
        return;
      }
      players.forEach(function (player) {
        characters.forEach(function (character) {
          if (character.type == "boss" && character.id == characterID &&
            player.socketID == socket.id && player.username == character.owner) {
            if (!character.stunned && !isNaN(abilityID) && abilityID < character.boss.abilities.length) {
              data.characters = characters;
              data.game_uuid = game_uuid;
              data.io = io;
              data.character = character;
              data.abilityID = abilityID;
              character.boss.abilities[abilityID](data);
            }
            return;
          }
        });
      });
    });
  };
  StartListening();

  /*
   Send Updates
   */
  function SendUpdates() {
    // Locations
    characters.forEach(function(character) {
      location.UpdateCharacterLocation(character.id, character.speed);
    });
    location.SendCharacterLocations();
    location.UpdateTime();
    // HP
    var hp = [];
    characters.forEach(function(character) {
      if (character.hp != character.prevhp) {
        hp.push({i:character.id, h:character.hp});
        character.prevhp = character.hp;
      }
    });
    socket.emit(Event.output.CHAR_HP, hp);
  }
  // Start Game Loop, 24 Updates per second
  setInterval(SendUpdates, 41);
};

Room.prototype.stop = function () {
// TODO : disconnect players, close socket, update redis, shutdown room
};

module.exports = Room;