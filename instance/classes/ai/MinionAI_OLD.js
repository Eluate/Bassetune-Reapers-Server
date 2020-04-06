var Item = require("../Item");

var MinionAI = function (characters, location) {
    this.location = location;
    this.characters = characters;
    this.setAggroRadius(5);
    this.setMaxDistanceFromHome(5);
};
MinionAI.prototype.setAggroRadius = function (radius) {
    this.aggroRadius = radius;
};
MinionAI.prototype.setMaxDistanceFromHome = function (distance) {
    this.maxDistanceFromHome = distance;
};

MinionAI.prototype.execute = function () {
    var minions = selectMinions(this.characters);
    var knights = selectKnights(this.characters);

    for (var i = 0; i < minions.length; i++) {
        var minion = minions[i];
        var knightToAggroFound = nearestKnightWithinRadius(minion, knights, this.aggroRadius);
        if (knightToAggroFound) {
            minion.isHeadingHome = false;
            minion.isAggroing = true;
            minion.isPatrolling = false;
            var destination = [knightToAggroFound.position.x, knightToAggroFound.position.y];
            this.location.UpdateDestination(minion, destination);
        } else if (isAtHome(minion) && !isPatrolling(minion)) {
            minion.isHeadingHome = false;
            minion.isAggroing = false;
            minion.isPatrolling = true;
        } else if (isTooFarFromHome(minion, this.location, this.maxDistanceFromHome)) {
            minion.isHeadingHome = true;
            minion.isAggroing = false;
            minion.isPatrolling = false;
            var destination = [minion.spawnPosition.x, minion.spawnPosition.y];
            this.location.UpdateDestination(minion, destination);
        } else if (isHeadingHome(minion)) {
            //Minion is coming back to home but is no more too far. It have to continue heading home.
        } else if (wasAggroing(minion)) {
            minion.isHeadingHome = true;
            minion.isAggroing = false;
            minion.isPatrolling = false;
            var destination = [minion.spawnPosition.x, minion.spawnPosition.y];
            this.location.UpdateDestination(minion, destination);
        } else if (isPatrolling(minion)) {
            minion.isHeadingHome = false;
            minion.isAggroing = false;
            minion.isPatrolling = true;
            //PATROL BEHAVIOUR TODO
        } else {
            //Keep doing last action and destination    
        }
    }
};

var nearestKnightWithinRadius = function (minion, knights, aggroRadius) {
    var nearestKnight = null;
    var nearestSqrDist = Number.MAX_VALUE;

    var sqrRadius = Math.pow(aggroRadius, 2);
    for (var i = 0; i < knights.length; i++) {
        var knight = knights[i];
        //minion is the center of the circle
        var sqrDist = Math.pow(knight.position.x - minion.position.x, 2) + Math.pow(knight.position.y - minion.position.y, 2);
        if (sqrDist < sqrRadius && sqrDist < nearestSqrDist) {
            nearestKnight = knight;
            nearestSqrDist = sqrDist;
        }
    }
    return nearestKnight;
};

var isAtHome = function (minion) {
    if (minion.position.x != minion.spawnPosition.x) return false;
    if (minion.position.y != minion.spawnPosition.y) return false;
    return true;
};

var isPatrolling = function (minion) {
    return minion.isPatrolling;
};

var isTooFarFromHome = function (minion, location, maxDistance) {
    var currentPosition = minion.position;
    var originalPosition = minion.spawnPosition;
    var distance = location.distance(originalPosition, currentPosition);
    if (distance <= maxDistance) return false;
    return true;
};

var isHeadingHome = function (minion) {
    return minion.isHeadingHome;
};

var wasAggroing = function (minion) {
    return minion.isAggroing;
};

var selectMinions = function (characters) {
    var result = [];
    for (var i = 0; i < characters.length; i++) {
        var each = characters[i];
        if (Item.ItemType.isMinion(each.entity)) result.push(each);
    }
    return result;
};
var selectKnights = function (characters) {
    var result = [];
    for (var i = 0; i < characters.length; i++) {
        var each = characters[i];
        if (Item.ItemType.isKnight(each.entity)) result.push(each);
    }
    return result;
};

module.exports = MinionAI;