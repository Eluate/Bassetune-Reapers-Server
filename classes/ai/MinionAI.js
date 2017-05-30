var Item = require("../Item");

var MinionAI = function (characters, location) {
	this.location = location;
	this.characters = characters;
    this.setAggroRadius(5);
};
MinionAI.prototype.setAggroRadius = function(radius) {
    this.aggroRadius = radius;
}

MinionAI.prototype.execute = function() {
    var minions = selectMinions(this.characters);
    var knights = selectKnights(this.characters);

    for (var i=0; i < minions.length; i++) {
        var minion = minions[i];
        var knightToAggroFound = nearestKnightWithinRadius(minion, knights, this.aggroRadius);
        if (!knightToAggroFound) {
            //PATROLLING or CHECK IF IS TO FAR FROM ORIGINAL SPAWN POINT
            //Note: It's necessary that the original spawn point is stored within the character instance
            continue;
        }
                
        var destination = [knightToAggroFound.position.x, knightToAggroFound.position.y]
        this.location.UpdateDestination(minion, destination);
    }  
};

var nearestKnightWithinRadius = function(minion, knights, aggroRadius) {
    var nearestKnight = null;
    var nearestSqrDist = Number.MAX_VALUE;

    var sqrRadius = Math.pow(aggroRadius, 2);
    for (var i=0; i< knights.length; i++) {
        var knight = knights[i];
        //minion is the center of the circle
        var sqrDist = Math.pow(knight.position.x - minion.position.x, 2) + Math.pow(knight.position.y - minion.position.y, 2);
        if (sqrDist < sqrRadius && sqrDist < nearestSqrDist)  {
            nearestKnight = knight;
            nearestSqrDist = sqrDist;
        }
    }
    return nearestKnight;
};

var selectMinions = function(characters) {
    var result = [];
    for (var i=0; i<characters.length; i++) {
        var each = characters[i];
        if (Item.ItemType.isMinion(each.entity)) result.push(each);
    }
    return result;
};
var selectKnights = function(characters) {
    var result = [];
    for (var i=0; i<characters.length; i++) {
        var each = characters[i];
        if (Item.ItemType.isKnight(each.entity)) result.push(each);
    }
    return result;
};

module.exports = MinionAI;