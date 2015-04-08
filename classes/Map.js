/*
 Class for the map (useful for collisions in usage with location)
 */
var THREE = require('three');
var Map = function () {
  // Create an instance of the collada loader
  var loader = new THREE.ColladaLoader();
  // Need to convert the axes so that our model does not stand upside-down
  loader.options.convertUpAxis = true;
  // TODO: Get the actual map and put it here instead of the model below
  loader.load('./models/robot01.dae', function (collada) {
    this.model = collada.scene;
  });
};

module.exports = Map;