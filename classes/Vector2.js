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
	multiplyScalar: function (v1, scale) {
		return {x: v1.x * scale, y: v1.y * scale};
	},
	divideScalar: function (v1, scale) {
		return {x: v1.x / scale, y: v1.y / scale};
	},
	distanceTo: function (v1, v2) {
		var xd = v2.x - v1.x;
		var yd = v2.y - v1.y;
		return Math.pow((xd * xd) + (yd * yd), 0.5);
	},
	rawDistanceTo: function (v1, v2) {
		var xd = v2.x - v1.x;
		var yd = v2.y - v1.y;
		return (xd * xd) + (yd * yd);
	},
	distanceToSegment: function (circle, v1, v2) {
		var l2 = Vector2.rawDistanceTo(v1, v2);
		if (l2 == 0) return Vector2.distanceTo(circle, v1);
		var t = ((circle.x - v1.x) * (v2.x - v1.x) + (circle.y - v1.y) * (v2.y - v1.y)) / l2;
		t = Math.max(0, Math.min(1, t));
		return Vector2.distanceTo(circle, {
			x: v1.x + t * (v2.x - v1.x),
			y: v1.y + t * (v2.y - v1.y)
		});
	},
	length: function (v1) {
		return this.distanceTo({x: 0, y: 0}, v1);
	},
	lerp: function (v1, v2, amount) {
		return {
			x: MathHelper.lerp(v1.x, v2.x, amount),
			y: MathHelper.lerp(v1.y, v2.y, amount)
		};
	},
	normalise: function (v1) {
		return this.divideScalar(v1, this.length(v1) || 1);
	},
	setLength: function (v1, length) {
		return this.multiplyScalar(this.normalise(v1), length);
	},
	wallCollision: function (v1, v2, wall) {
		var rect2 = {
			x: wall.x1, //+ Math.abs((wall.x1 - wall.x2) / 2),
			y: wall.y1, //+ Math.abs((wall.y1 - wall.y2) / 2),
			w: Math.abs(wall.x1 - wall.x2),
			h: Math.abs(wall.y1 - wall.y2)
		};
		var rect1 = {
			x: Math.min(v1.x, v2.x) + Math.abs((v1.x - v2.x) / 2),
			y: Math.min(v1.y, v2.y) + Math.abs((v1.y - v2.y) / 2),
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
	pointCollision: function (v1, v2, v3) {
		return (v3.x >= Math.min(v1.x, v2.x) && v3.x <= Math.max(v1.x, v2.x) &&
		v3.y >= Math.min(v1.y, v2.y) && v3.y <= Math.max(v1.y, v2.y))
	},
	lineToCircleCollision: function (circle, v1, v2) {
		return this.distanceToSegment(circle, v1, v2) <= circle.r;
	},
	circleArcProjection: function (origin, direction, radius, angle) {
		var v1 = {x: direction.x, y: direction.y};
		var angleRadians = angle * Math.PI / 180;

		var tempX = v1.x;
		v1.x = (tempX * Math.cos(angleRadians)) - (v1.y * Math.sin(angleRadians));
		v1.y = (tempX * Math.sin(angleRadians)) + (v1.y * Math.cos(angleRadians));

		v1 = this.setLength(v1, radius);
		v1 = this.add(v1, origin);

		return v1;
	},
	circleToCircleCollision: function (c1, c2) {
		var dx = (c1.x + c1.r) - (c1.x + c2.r);
		var dy = (c1.y + c1.r) - (c2.y + c2.r);
		var distance = Math.sqrt(dx * dx + dy * dy);

		return distance < c1.r + c2.r;
	}
};

var MathHelper = {
	// Get a value between two values
	clamp: function (value, min, max) {

		if (value < min) {
			return min;
		}
		else if (value > max) {
			return max;
		}

		return value;
	},
	// Get the linear interpolation between two value
	lerp: function (value1, value2, amount) {
		amount = amount < 0 ? 0 : amount;
		amount = amount > 1 ? 1 : amount;
		return value1 + (value2 - value1) * amount;
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