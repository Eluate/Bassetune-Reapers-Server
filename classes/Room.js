var Room = function (io, socket, game_uuid, config) {
  var Event = require('./EventEnum');
  var Chat = require('./Chat');
  var Gamestate = require('./Gamestate');
  var Player = require('./Player');
  var Location = require('./Location');
  var players = {};

  var chat = new Chat(io, game_uuid);
  var gamestate = new Gamestate(io, game_uuid);
  var location = new Location(io, game_uuid);

  /*
   Handle Reconnection
   */
  socket.in(game_uuid).on('register', function (data) {
    players.forEach(function (player) {
      // TODO: Read redis for username uuid, replace with cuAtrrentPlayer.username on next line
      if (currentPlayer.username = player.username)
        players[player.socketID] = socket;
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
      chat.addMsg(players[socket.id].username, data.message);
    });
    socket.in(game_uuid).on(Event.input.MOVE, function (data) {
      location.UpdateCharacterLocation(data.character, data.vector)
    });
    socket.in(game_uuid).on(Event.input.LEAVE, function () {
      require('./Disconnect').disconnect(socket.id);
    });
    socket.in(game_uuid).on(Event.input.knight.CHANGE_WEAPON, function (data) {
      // TODO: Access changing weapons
    });
    socket.in(game_uuid).on(Event.input.knight.CHANGE_ARMOR, function (data) {
      // TODO: Access changing armor
    });
    socket.in(game_uuid).on(Event.input.knight.USE_ABILITY, function (data) {
      // TODO: Use Knight Ability
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
  }

  // Quick Game Loop, 12 Updates per second
  setTimeout(SendUpdates(), 83);

};

Room.prototype.stop = function () {
// TODO : disconnect players, close socket, update redis, shutdown room
};


module.exports = Room;