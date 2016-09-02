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
  collisionPointDistanced: function (v1, v2, v3, length) {
    var x = v3.x;
    var y = v3.y;
    var minX = Math.min(v1.x, v2.x);
    var minY = Math.min(v1.y, v2.y);
    var maxX = Math.max(v1.x, v2.x);
    var maxY = Math.max(v1.y, v2.y);

    var midX = (minX + maxX) / 2;
    var midY = (minY + maxY) / 2;
    // if (midX - x == 0) -> m == �Inf -> minYx/maxYx == x (because value / �Inf = �0)
    if (midX - x == 0 || midY - y == 0) {
      return {x: x, y: y};
    }

    var m = (midY - y) / (midX - x);

    // Check left side
    if (x <= midX) {
      var minXy = m * (minX - x) + y;
      if (minY < minXy && minXy < maxY)
        return {x: minX - length, y: minXy};
    }
    // Check right side
    if (x >= midX) {
      var maxXy = m * (maxX - x) + y;
      if (minY < maxXy && maxXy < maxY)
        return {x: maxX + length, y: maxXy};
    }
    // Check bottom side
    if (y <= midY) {
      var minYx = (minY - y) / m + x;
      if (minX < minYx && minYx < maxX)
        return {x: minYx, y: minY - length};
    }
    // Check top side
    if (y >= midY) {
      var maxYx = (maxY - y) / m + x;
      if (minX < maxYx && maxYx < maxX)
        return {x: maxYx, y: maxY + length};
    }

    return {x: y, y: x};
  }
};

module.exports = Vector2;