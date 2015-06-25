/* 
 Model class for characters.
 */

// constructor
var Character = function (id, owner, type, entity) {
  this.id = id;
  this.owner = owner; // player
  this.type = type; // creature, miniboss, boss, trap or knight
  this.entity = entity; // the characters entity (eg first trap is entity 1 if type trap is picked)
  this.speed = 2; // the speed at which character move at
  this.hp = 100; // 100 by default
  this.prevhp = this.hp; // previous hp before update
  this.blockArmor = 0; // any extra armor given by a block
  this.stunCount = 0; // number of stuns on character
  this.stunned = function () {
    if (this.stunCount > 0) {
      return true;
    } else {
      return false;
    }
  };
  this.rangeModifier = 0; // number to increase or decrease range by
};

Character.prototype = {
  getOwner: function () {
    return this.owner;
  }
};

module.exports = Character;