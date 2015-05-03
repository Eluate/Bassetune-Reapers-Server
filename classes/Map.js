/*
 Class for the map (useful for collisions in usage with location)
 */

var Loader = require("./ColladaLoader");
var Map = function () {
  // Create an instance of the collada loader
  var loader = new Loader.ColladaLoader();
  // Need to convert the axes so that our model does not stand upside-down
  loader.options.convertUpAxis = true;
  // TODO: Get the actual map and put it here instead of the model below
  // TODO: Implement random generating map
  loader.load('./models/maps/zuendholz_cathedral.dae', function (collada) {
    this.model = collada.scene;
  });
};

module.exports = Map;