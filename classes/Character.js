/* 
	Model class for characters.
*/

// constructor
var Character = function(location, owner) {

	this.id = ++this.prototype.Count;
	this.location = location;
	this.owner = owner; // player
};

Character.prototype = {
	
	Count: 0,
	
	getOwner: function() {
		return this.owner;
	}
};

module.exports = Character;