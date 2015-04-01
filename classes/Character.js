/* 
	Model class for characters.
*/

// constructor
var Character = function(location, owner, type, object) {

	this.id = ++this.prototype.Count;
	this.location = location;
	this.owner = owner; // player
    this.type = type;
    this.object = object;
};

Character.prototype = {
	
	Count: 0,
	
	getOwner: function() {
		return this.owner;
	}
};

module.exports = Character;