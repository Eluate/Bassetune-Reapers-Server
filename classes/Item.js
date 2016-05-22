/*
 Class for item usage
 */
var Vec2 = require("./Vector2");
var Items = require('./resources/items');

var Item = function(id) {
  var item = null;
	for (var i = 0; i < Items.length; i++) {
		if (id == Items[i].item_id) {
			item = Items[i];
		}
	}
  this.id = id;
  this.purpose = item.purpose;
  this.value = item.value;
  this.duration = item.duration;
  this.consumeTime = item.consume_time;
  this.intByStun = item.interrupted_by_stun;
  this.intByDamage = item.interrupted_by_damage;
  this.intByAbilityUse = item.interrupted_by_ability_use;
  this.intByMovement = item.interrupted_by_move;
  this.range = item.range;
  // The information from the initial use item
  this.info = {};
};

Item.prototype = {
  UseItem: function (data) {
    // Variables are characters, character, location and target
    var characters = data.characters;
    var character = data.character;
    var target = data.target;
    var location = data.location;
    if (character.channelling == true) {
      return;
    }
    this.info = data;
    // Check if the character has items remaining
    if (this.itemQuantity < 1) {
      return;
    }
    this.itemQuantity -= 1;
    character.channelling = true;
    character.channellingAbility = this;
    data.io.to(data.game_uuid).emit(Event.output.knight.USE_ITEM_START, {"i":character.id, "t":this.id});
    setTimeout(function() {
      // Check if channelling has been cancelled
      if (character.channelling != true) {
        if (this.intByStun == true && character.channelling.indexOf("s") > -1) {
          return;
        }
        if (this.intByDamage == true && character.channelling.indexOf("d") > -1) {
          return;
        }
        if (this.intByAbilityUse == true && character.channelling.indexOf("a") > -1) {
          return;
        }
      }
      // Start effects of the item
      if (this.purpose == "H_Heal") {
        character.hp = character.hp + this.value;
      }
      else if (this.purpose == "H_Regeneration") {
        var regen = setInterval(function() {
          character.hp = character.hp + (this.value / this.duration);
        }, 1000);
        setTimeout(function() {
          clearInterval(regen);
        }, this.duration * 1000);
      }
      else if (this.purpose == "Resurrect") {
        // Location of knight using the item
        var curLocation = character.position;
        for (var i = 0, charactersLength = characters.length; i < charactersLength; i++) {
          // Can't revive self or non-knights
          if (character.id = characters[i] || characters[i].type != "knight" || !characters[i].isDead()) {
            return;
          }
          // Location of knight to be revived
          var knightLocation = characters[i].position;
          if (Vec2.distanceTo(curLocation, knightLocation) < this.range) {
            // Convert the percentage to a decimal of item value and multiply it by maxhp to revive character
            characters[i].hp += characters[i].maxhp * (this.value / 100);
          }
        }
      }
      else if (this.purpose == "I_Ranged") {
        if (!target.hasOwnProperty("x") || !target.hasOwnProperty("y")) {
          return;
        }
        // Location of knight using the item
        var curLocation = character.position;
        for (var i = 0, characterLength = characters.length > 0; i < characterLength; i++) {
          // Can't attack friendly knights or themself
          if (character.id == characters[i].id || characters[i].type == "knight") {
            return;
          }
          // Broad Phase
          var newLocation = characters[i].position;
          if (Vec2.distanceTo(curLocation, newLocation) < this.range) {
            return;
          }
          // Narrow Phase
          target -= curLocation;
          target = Vec2.add(Vec2.setLength({x: target.x + i, y: target.y + i}, 30), curLocation);
          if (Vec2.pointCollision(curLocation, newLocation, target)) {
            characters[i].hp -= this.value;
          }
        }
      }
      data.io.to(data.game_uuid).emit(Event.output.knight.USE_ITEM_END, {"i":character.id});
      character.channelling = false;
    }, this.consumeTime * 1000);
  },
  CheckInterruption: function () {
    var data = this.info;
    var character = data.character;
    var roomID = data.game_uuid;
    var io = data.io;
    if (character.channelling != true) {
      if (this.intByStun == true && character.channelling.indexOf("s") > -1) {
        io.to(roomID).emit(Event.output.knight.USE_ITEM_INTERRUPTED, {"i":character.id});
        character.channelling = false;
      }
      else if (this.intByDamage == true && character.channelling.indexOf("d") > -1) {
        io.to(roomID).emit(Event.output.knight.USE_ITEM_INTERRUPTED, {"i":character.id});
        character.channelling = false;
      }
      else if (this.intByAbilityUse == true && character.channelling.indexOf("a") > -1) {
        io.to(roomID).emit(Event.output.knight.USE_ITEM_INTERRUPTED, {"i":character.id});
        character.channelling = false;
      }
      else if (this.intByMovement == true && character.channelling.indexOf("m") > -1) {
        io.to(roomID).emit(Event.output.knight.USE_ITEM_INTERRUPTED, {"i":character.id});
        character.channelling = false;
      }
    }
  }
};

Item.H_Specials = function () {

};

/* Item types include:
- H_Heal
- H_Regen
- H_Special
- H_Resurrect
- A_Arrows
- A_Bolts
- I_Ranged
 */

module.exports = Item;