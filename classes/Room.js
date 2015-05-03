var Room = function (io, socket, game_uuid, config) {
  var Event = require('./EventEnum');
  var Chat = require('./Chat');
  var Player = require('./Player');
  var Location = require('./Location');
  var Map = require('./Map');

  var map = new Map();
  var chat = new Chat(io, game_uuid);
  var location = new Location(io, game_uuid, map);

  var players = [];
  var characters = [];
  var knights = [];

  /*
   Handle Reconnection
   */
  socket.in(game_uuid).on('register', function (data) {
    players.forEach(function (player) {
      // TODO: Read redis for username uuid, replace with data.uuid on next line
      if (data.uuid == player.username) {
        players[player.socketID].socketID = socket;
      }
      else {
        // Delete socket connection
      }
    });
  });

  /*
   Listeners: Input from the player
   */
  function StartListening() {
    socket.in(game_uuid).on('disconnect', function () {
      require('./Disconnect').disconnect(socket);
    });
    socket.in(game_uuid).on(Event.input.TALK, function (data) {
      players.forEach(function (player) {
        if (player.socketID == socket.id) {
          chat.addMsg(player.username, data.message);
        }
      });
    });
    socket.in(game_uuid).on(Event.input.MOVE, function (data) {
      characters.forEach(function (character) {
        players.forEach(function (player) {
          if (character.id == data.characterID && player.socketID == socket.id && player.username == character.owner) {
            if (!character.stunned) {
              location.UpdateCharacterLocation(data.characterID, data.vector, characters[data.characterID].speed);
            }
          }
        });
      });
    });
    socket.in(game_uuid).on(Event.input.LEAVE, function () {
      io.sockets.connected[socket.id].disconnect();
    });
    socket.in(game_uuid).on(Event.input.knight.CHANGE_EQUIPPED, function (data) {
      if (players[socket.id].username == knights[data.knightID].character.owner) {
        knights[data.knightID].ChangeEquipped(data.itemID, data.target);
      }
    });
    socket.in(game_uuid).on(Event.input.knight.USE_ABILITY, function (data) {
      knights.forEach(function (knight) {
        players.forEach(function (player) {
          if (knight.character.id == data.characterID && player.socketID == socket.id && player.username == knight.character.owner) {
            if (!knight.character.stunned) {
              knight.UseAbility(data.weapon, data.abilityID, data.target, location, characters);
            }
          }
        });
      });
    });
    socket.in(game_uuid).on(Event.input.knight.USE_ITEM, function (data) {
      // TODO: Use Knight Item
    });
    socket.in(game_uuid).on(Event.input.boss.PUT_TRAP, function (data) {
      // TODO: Put a trap
    });
    socket.in(game_uuid).on(Event.input.boss.SPAWN_CREATURE, function (data) {
      // TODO: Spawn a creature
    });
    socket.in(game_uuid).on(Event.input.boss.USE_ABILITY, function (data) {
      // TODO: Use an ability
    });
  }
  StartListening();

  /*
   Send Updates
   */
  function SendUpdates() {
    location.SendCharacterLocations();
    setTimeout(SendUpdates, 41);
    console.log("Sent out updates.");
  }
  // Start Game Loop, 24 Updates per second
  setTimeout(SendUpdates, 41);

};

Room.prototype.stop = function () {
// TODO : disconnect players, close socket, update redis, shutdown room
};

module.exports = Room;