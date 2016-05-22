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
  this.weapons = null;
  this.items = null;
  this.armor = null;
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

Inventory.prototype.sortInventory = function () {
  var sortedItems = [];
  for (var i = 0; i < this.items.length; i++) {
    sortedItems.push(new Item(this.items[i].item_id));
    sortedItems[i].itemQuantity = this.items.item_quantity;
  }
  this.items = sortedItems;
};

module.exports = Inventory;