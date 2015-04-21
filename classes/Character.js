/* 
 Model class for characters.
 */

// constructor
var Character = function (location, owner, type, entity, speed) {
  this.id = ++this.prototype.Count;
  this.location = location;
  this.owner = owner; // player
  this.type = type; // creature, miniboss, boss, trap or knight
  this.entity = entity; // the characters entity (eg first trap is entity 1 if type trap is picked)
  this.speed = speed; // the speed at which character move at
  this.hp = 100; // 100 by default
  this.blockArmor = 0; // any extra armor given by a block
  this.stunned = false; // is it stunned
  this.stunCount = 0; // number of stuns on character
  this.rangeModifier = 0; // number to increase or decrease range by

};

Character.prototype = {

  Count: 0,

  getOwner: function () {
    return this.owner;
  }
};

module.exports = Character;