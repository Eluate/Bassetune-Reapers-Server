/*
 Class for the map (useful for collisions in usage with location)
 */

var THREE = require("three");
var Map = function () {
  // TODO: Implement random generating map
  this.geom = [];
  for (var i = 0; i < 10000; i += 0.2) {
    this.geom.push({x: i, y: i});
  }
};

module.exports = Map;