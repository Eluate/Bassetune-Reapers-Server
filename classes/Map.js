/*
 Class for the map (useful for collisions in usage with location)
 */

var THREE = require("three");
var Map = function () {
  // TODO: Implement random generating map
  this.geom = [];
  for (var i = 0; i < 10; i++) {
    this.geom.push(new THREE.Vector2(0, i));
  }
};

module.exports = Map;