/**
 * Model class for Traps
 */

/*
 * Adding only the detection system first.
 */

var Location = require('./Location');
var Vec2 = require('./Vector2');
var Traps = require('./resources/traps');

var Trap = function (id, loc, map) {
    var trap = Traps[id];

    this.position = {
        x: loc.x,
        y: loc.y
    };
    this.width = trap['width'];
    this.damage = trap['damage'];
};

Trap.prototype = {
    isTriggered: function (knight_index) {
        var knight_position = Location.GetCharacterLocation(knight_index);
        var trap_bottom_right = {
            x: this.position.x + this.width,
            y: this.position.y + this.height
        };
        for (var i = 0; i < map.traps.length; i++) {
            if (Vec2.pointCollision(this.position, trap_bottom_right, knight_position))
                console.log("Trap triggered!");
        }
    }
};

module.exports = Traps;