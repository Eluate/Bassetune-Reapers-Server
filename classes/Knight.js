/*
 Model class for knights. Inheritance from Character.
 */
var Character = require('./Character');
var Inventory = require('./Inventory');

var Knight = function (location, owner) {
  this.character = new Character(location, owner, "knight", 0, 0);
  this.inventory = new Inventory();

  this.UseWeapon = function (weapon, target) {
    // TODO
  };

  this.UseAbility = function (weapon, target) {
    // TODO
  };

  this.UseItem = function (weapon, target) {
    // TODO
  };
};