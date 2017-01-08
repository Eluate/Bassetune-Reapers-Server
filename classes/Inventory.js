/*
 Model class for inventories.
 */
var Item = require('./Item');

var Inventory = function () {
  this.slots = {};

  this.getFreeSpace = function () {
    var count = 0;
    this.slots.forEach(function (slot) {
      if (slot.number > -1) {
        count++;
      }
    });
    return Inventory.getMaxSpace - count;
  };

  // TODO : create appropriate classes for stuff
  this.weapons = [null, null];
  this.armor = null;
  this.ammo = null;
  this.abilities = null;
};

Inventory.prototype.getMaxSpace = function () {
  return 24;
};

Inventory.prototype.getMaxStackSize = function (isThrowing) {
  if (isThrowing) {
    return 200;
  } else {
    return 1;
  }
};

module.exports = Inventory;