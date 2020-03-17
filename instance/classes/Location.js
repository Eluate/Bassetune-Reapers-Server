/*
Model class for location (characters, traps...)
*/
var Event = require('./EventEnum');
var Item = require('./Item');
var Vec2 = require("./Vector2");
var SAT = require("sat");

var Location = function (self) {
    this.PF = require("pathfinding");
    this.pathfinder = new this.PF.AStarFinder();
    this.characters = [];
    this.knights = [];
    this.lastTime = new Date().getTime() / 1000;
    this.map = self.map;
    this.io = self.io;
    this.matchID = self.matchID;
    this.zoneCount = 0;
};

Location.prototype = {
    UpdateDestination: function (character, vector) {
        var vector = {
            x: parseFloat(vector[0]).toFixed(2),
            y: parseFloat(vector[1]).toFixed(2)
        };

        if (isNaN(vector.x) || isNaN(vector.y)) return;

        // Check if character is player controlled
        if (Item.ItemType.isKnight(character.entity) || Item.ItemType.isLord(character.entity) || Item.ItemType.isLesserLord(character.entity)) {
            character.path = [[vector.x, vector.y]];
        }
        // Otherwise use pathfinding for AI
        else if (vector.x < this.map.pfGrid.width && vector.y < this.map.pfGrid.height) {
            var grid = this.map.pfGrid.clone();
            var path = this.pathfinder.findPath(parseInt(character.position.x), parseInt(character.position.y), parseInt(vector.x), parseInt(vector.y), grid);
            path = this.PF.Util.compressPath(path);
            path.shift();
            character.path = path;
            //console.log("Updated path");
            //console.log(character.path)
        } else {
            character.path = null;
        }
        character.channelling = false;
    },

    UpdateCharacterPositions: function () {
        var time = new Date().getTime() / 1000;
        for (var key in this.characters) {
            var character = this.characters[key];
            if (!this.characters.hasOwnProperty(key)) continue;
            if (character.path == null || character.path == undefined || character.path.length == 0) continue;
            // Disable pathfinding if character starts channelling
            if (character.channelling != false || character.stunned()) {
                character.path = null;
                continue;
            }

            var prevPosition = character.position;
            var speed = character.speed * (time - this.lastTime);
            var distanceTravelled = 0.0;
            var destination = {
                x: Number(character.path[0][0]),
                y: Number(character.path[0][1])
            };

            while (distanceTravelled < speed && character.path && character.path.length > 0) {
                var prevPosition = character.position;
                var distanceToPoint = Vec2.distanceTo(destination, prevPosition);
                // Handle speed Limits
                if (distanceToPoint > speed) {
                    // If character is moving to fast, move it at maximum speed to destination
                    var newPosition = Vec2.add(prevPosition, Vec2.setLength(Vec2.sub(destination, prevPosition), speed - distanceTravelled));
                    if (this.CheckCollision(prevPosition, newPosition, speed)) {
                        character.path = null;

                    } else {
                        prevPosition = newPosition;
                        distanceTravelled += speed;
                    }
                } else {
                    if (this.CheckCollision(prevPosition, destination, speed)) {
                        character.path = null;

                    } else {
                        prevPosition = destination;
                        distanceTravelled += speed;
                        // Remove element from path
                        character.path.shift();
                    }
                }
            }
            // Update location
            this.characters[key].position = prevPosition;
        }
    },

    CheckCollision: function (prevPosition, destination) {
        var playerToDestinationRawDistance = Vec2.rawDistanceTo(prevPosition, destination) + 0.71;
        var collisionCircle = new SAT.Circle(new SAT.Vector(destination.x, destination.y), 0.7);
        for (var i = 0; i < this.map.grid.length; i++) {
            for (var j = 0; j < this.map.grid[0].length; j++) {
                if (this.map.grid[i][j] == 0) continue;
                // Broad Phase
                if (Vec2.rawDistanceTo(prevPosition, {x: i, y: j}) >= playerToDestinationRawDistance) {
                    continue;
                }
                // Narrow Phase
                if (SAT.pointInCircle(new SAT.Vector(i, j), collisionCircle)) {
                    return true;
                }
            }
        }
    },

    UpdateTime: function () {
        this.lastTime = new Date().getTime() / 1000;
    },

    SendCharacterLocations: function () {
        // TODO: Make it so that it only sends locations in a certain area for knights
        var data = [];
        for (var key in this.characters) {
            var character = this.characters[key];
            if (character.prevPosition != character.position) {
                var info = {
                    i: character.id,
                    l: [0, 0]
                };
                info.l[0] = character.position.x;
                info.l[1] = character.position.y;
                data.push(info);
                character.prevPosition = character.position;
            }
        }
        if (data.length > 0) {
            this.io.to(this.matchID).emit(Event.output.CHAR_LOCATIONS, {"d": data});
        }
    },

    isKnightZoneWin: function () {
        var time = new Date().getTime() / 1000;
        // Loop through all knights and check if any one is in the zone
        var knightInZone = false;
        for (var i = 0; i < this.knights.length; i++) {
            // Check if near lord door and not blocked by wall
            var knightPosition = this.knights[i].position;
            if (Vec2.distanceTo(knightPosition, this.map.doorLocation) <= 3) {
                // Check if collides with wall or not first
                var knightHasCollided = false;
                for (var p = 0; p < this.map.grid.length; p++) {
                    for (var j = 0; j < this.map.grid[0].length; j++) {
                        if (this.map.grid[p][j] == 0 || {x: p, y: j}.toString() == this.map.doorLocation) continue;
                        // Broad Phase
                        if (Vec2.distanceTo(knightPosition, {x: p, y: j}) > 3) {
                            continue;
                        }
                        // Narrow Phase
                        var wall = {
                            x: p,
                            y: j,
                            r: 0.5
                        };
                        if (Vec2.lineToCircleCollision(wall, knightPosition, this.map.doorLocation)) {
                            // Collision occurred
                            knightHasCollided = true;
                        }
                    }
                }
                if (!knightHasCollided) {
                    knightInZone = true;
                }
            }
        }

        if (knightInZone) {
            this.zoneCount += time - this.lastTime;
            console.log(this.zoneCount);
        } else {
            this.zoneCount = 0;
        }

        return this.zoneCount >= 15;
    },

    distance: function (fromPosition, toPosition) {
        var fromX = parseInt(fromPosition.x);
        var fromY = parseInt(fromPosition.y);
        var toX = parseInt(toPosition.x);
        var toY = parseInt(toPosition.y);
        var grid = this.map.pfGrid.clone(); //one shoot grid for pathfinder //see: https://www.npmjs.com/package/pathfinding
        var path = this.pathfinder.findPath(fromX, fromY, toX, toY, grid);
        return path.length;
    },

    /* Calculate dinamically walkable place around a 'centerPosition' at 'ray' distance.
     * At the moment, used to find place to go for patrol.
     * NOTE: Eventually patrol spots could be pre-calculated at start-up for each npc.
    */
    walkablePlacesAround: function (centerPosition, ray) {
        var result = [];
        var grid = this.map.grid;
        var gridRows = grid.length;
        var gridCols = grid[0].length;
        //X is Row or Y is Row???
        //looking at isKnightZoneWin function, it seems X is ROW
        var centerRow = parseInt(centerPosition.x);
        var centerCol = parseInt(centerPosition.y);
        if (!(centerRow >= 0 && centerRow < gridRows)) return result;
        if (!(centerCol >= 0 && centerCol < gridCols)) return result;

        var fromRow = centerRow - ray;
        if (fromRow < 0) fromRow = 0;
        var toRow = centerRow + ray;
        if (toRow >= gridRows) toRow = gridRows - 1;

        var fromCol = centerCol - ray;
        if (fromCol < 0) fromCol = 0;
        var toCol = centerCol + ray;
        if (toCol >= gridCols) toCol = gridCols - 1;

        for (var row = fromRow; row <= toRow; row++) {
            for (var col = fromCol; col <= toCol; col++) {
                //if is walkable, store it
                if (grid[row][col] === 0) result.push({"x": row, "y": col});
            }
        }

        //If no walkable cell found, try to reduce ray by 1 and retry.
        if (result.length === 0 && ray > 0) this.walkablePlacesAround(centerPosition, ray - 1);
        else return result;
    }
};

module.exports = Location;