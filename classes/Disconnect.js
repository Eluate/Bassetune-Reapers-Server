/*
 Class that handles disconnection
 */
var Event = require('./EventEnum');

module.exports = function (socket, username, roomID, io) {
  // TODO: Disconnect User
  // Force disconnect socket if it exists
  if (socket) {
    socket.disconnect();
  }
  // Emit that the player has disconnected to all players
  io.to(roomID).emit(Event.output.PLAYER_LEAVES, username);
  console.log("Game ID: " + roomID + " player at socket " + socketID + " left.")
};