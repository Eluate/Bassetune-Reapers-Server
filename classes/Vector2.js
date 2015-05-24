/**
 * Method class for vectors
 */
var Vector2 = {
  add: function (v1, v2) {
    return {x: v1.x + v2.x, y: v1.y + v2.y};
  },
  sub: function (v1, v2) {
    return {x: v1.x - v2.x, y: v1.y - v2.y};
  },
  multiplyScalar: function(v1, scale) {
    return {x: v1.x * scale, y: v1.y * scale};
  },
  divideScalar: function(v1, scale) {
    return {x: v1.x / scale, y: v1.y / scale};
  },
  distanceTo: function(v1, v2) {
    return Math.pow(((v2.x - v1.x) * (v2.x - v1.x)) + ((v2.y - v1.y) * (v2.y - v1.y)), 0.5);
  },
  length: function(v1) {
    return this.distanceTo({x: 0, y: 0}, v1);
  },
  normalise: function(v1) {
    return this.divideScalar(v1, this.length(v1));
  },
  setLength: function(v1, length) {
    return this.multiplyScalar(this.normalise(v1), length);
  }
};

//Vector2.prototype.add = function (v1, v2) {
//  return {x: v1.x + v2.x, y: v1.y + v2.y};
//};
//Vector2.prototype.sub = function (v1, v2) {
//  return {x: v1.x - v2.x, y: v1.y - v2.y};
//};
//Vector2.prototype.multiplyScalar = function(v1, scale) {
//  return {x: v1.x * scale, y: v1.y * scale};
//};
//Vector2.prototype.divideScalar = function(v1, scale) {
//  return {x: v1.x / scale, y: v1.y / scale};
//};
//Vector2.prototype.length = function(v1) {
//  return this.distanceTo({x: 0, y: 0}, v1);
//};
//Vector2.prototype.normalise = function(v1) {
//  return this.divideScalar(v1, this.length(v1));
//};
//Vector2.prototype.setLength =  function(v1, length) {
//  return this.multiplyScalar(this.normalise(v1), length);
//};

module.exports = Vector2;