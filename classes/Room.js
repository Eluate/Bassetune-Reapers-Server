var Room = function (io, socket, game_uuid, config) {
  var Event = require('./EventEnum');
  var Chat = require('./Chat');
  var Location = require('./Location');
  var Map = require('./Map');
  var Event = require('./EventEnum');

  var map = new Map();
  var chat = new Chat(io, game_uuid);
  var location = new Location(io, game_uuid, map);

  // All players that exist in the current game
  var players = [];
  // All characters
  var characters = [];
  // All knight type
  var knights = [];
  // All boss type
  var bosses = [];
  // All miniboss type
  var minibosses = [];
  // All creature type
  var creatures = [];


  /*
    Get player Data
   */
  this.StorePlayerData = function (data) {
    // TODO: Store player data
    players = data;
  };

  /*
   Handle Reconnection
   */
  socket.in(game_uuid).on('register', function (data) {
    var hasRegistered = false;
    players.forEach(function (player) {
      // TODO: Read redis for username uuid, replace with data.uuid on next line
      if (data.uuid == player.uuid) {
        players[player.socketID].socketID = socket;
        hasRegistered = true;
      }
    });
    if (!hasRegistered) {
      socket.disconnect();
    }
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
      characters.forEach(function (character) {
        players.forEach(function (player) {
          if (character.id == data.characterID && player.socketID == socket.id && player.username == character.owner) {
            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                location.UpdateDestination(key, data[key]);
              }
            }
          }
        });
      });
    });
    // Leave
    socket.in(game_uuid).on(Event.input.LEAVE, function () {
      io.sockets.connected[socket.id].disconnect();
    });
    // Knight changing equipped
    socket.in(game_uuid).on(Event.input.knight.CHANGE_EQUIPPED, function (data) {
      if (players[socket.id].username == knights[data.knightID].character.owner) {
        knights[data.knightID].ChangeEquipped(data.itemID, data.target);
      }
    });
    // Knight using ability
    socket.in(game_uuid).on(Event.input.knight.USE_ABILITY, function (data) {
      if (data.characterID == null || data.abilityID == null || data.weapon == null) {
        return;
      }
      knights.forEach(function (knight) {
        players.forEach(function (player) {
          if (knight.character.id == data.characterID && player.socketID == socket.id && player.username == knight.character.owner) {
            if (!knight.character.stunned) {
              knight.UseAbility(data.weapon, data.abilityID, data.target, location, characters, game_uuid);
            }
            return;
          }
        });
      });
    });
    // Knight using item
    socket.in(game_uuid).on(Event.input.knight.USE_ITEM, function (data) {
      // TODO: Use Knight Item
    });
    // Boss putting a trap down
    socket.in(game_uuid).on(Event.input.boss.PUT_TRAP, function (data) {
      // TODO: Put a trap
    });
    // Boss using an ability
    socket.in(game_uuid).on(Event.input.boss.USE_ABILITY, function (data) {
      // TODO: Use an ability
      if (data.characterID == null || data.abilityID == null) {
        return;
      }
      players.forEach(function (player) {
        bosses.forEach(function (boss) {
          if (boss.character.type == "boss" && boss.character.id == data.characterID &&
            player.socketID == socket.id && player.username == boss.character.owner) {
            if (!boss.character.stunned && !isNaN(parseInt(data.abilityID)) && parseInt(data.abilityID) < boss.abilities.length) {
              data.characters = characters;
              data.room = game_uuid;
              boss.abilities[data.abilityID](data);
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
    // TODO: Optimize for more hp to be sent at once
    characters.forEach(function(character) {
      if (character.hp != character.prevhp) {
        socket.emit(Event.output.CHAR_HP, {i: character.id, h: character.hp});
        character.prevhp = character.hp;
      }
    });
  }
  // Start Game Loop, 24 Updates per second
  setInterval(SendUpdates, 41);
};

Room.prototype.stop = function () {
// TODO : disconnect players, close socket, update redis, shutdown room
};

module.exports = Room;