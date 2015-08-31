/*
 Class for the map (useful for collisions in usage with location)
 */

var Map = function () {
  // TODO: Implement random generating map
  this.geom = [];
  for (var i = 0; i < 10000; i += 1) {
    this.geom.push({x1: i, y1: i, x2: i + i, y2: i + i});
  }
};

// Map.prototype = {
//   EmitMap: function(io, socketID) {
//     io.sockets.socket(socket.id).emit(JSON.stringify(this.geom));
//   }
// };

module.exports = Map;