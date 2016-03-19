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
    var xd = v2.x - v1.x;
    var yd = v2.y - v1.y;
    return Math.pow((xd * xd) + (yd * yd), 0.5);
  },
  length: function(v1) {
    return this.distanceTo({x: 0, y: 0}, v1);
  },
  normalise: function(v1) {
    return this.divideScalar(v1, this.length(v1));
  },
  setLength: function(v1, length) {
    return this.multiplyScalar(this.normalise(v1), length);
  },
  wallCollision: function (v1, v2, wall) {
    var rect2 = {
      x: wall.x1 + ((wall.x1 - wall.x2) / 2),
      y: wall.y1 + ((wall.y1 - wall.y2) / 2),
      w: Math.abs(wall.x1 - wall.x2),
      h: Math.abs(wall.y1 - wall.y2)
    };
    var rect1 = {
      x: v1.x + (v1.x - v2.x / 2),
      y: v1.x + (v1.x - v2.x / 2),
      w: Math.abs(v1.x - v2.x),
      h: Math.abs(v1.y - v2.y)
    };
    if (rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.h + rect1.y > rect2.y) {
        // Collision occurred
      return true;
    }
    else {
      return false;
    }
  },
  // Broken
  /*
  pointCollision: function(v1, v2, v3) {
    var rect2 = {
      x: v3.x,
      y: v3.y,
      w: 1,
      h: 1
    };
    var rect1 = {
      x: v1.x + (v1.x - v2.x / 2),
      y: v1.x + (v1.x - v2.x / 2),
      w: Math.abs(v1.x - v2.x),
      h: Math.abs(v1.y - v2.y)
    };
    if (rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.h + rect1.y > rect2.y) {
      // Collision occurred
      return true;
    }
    else {
      return false;
    }
  }
  */
  pointCollision: function(v1, v2, v3) {
    return (v3.x < Math.min(v1.x,v2.x) || v3.y < Math.min(v1.y,v2.y) ||
            v3.x > Math.max(v1.x,v2.x) || v3.y > Math.max(v1.y,v2.y))
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