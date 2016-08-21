/*
 Class for item usage
 */
var Vec2 = require("./Vector2");
var Items = require('./resources/items');
var Event = require('./EventEnum');

var Item = {
	UseItem: function (data) {
		// Variables are characters, character, location and target
		var characters = data.characters;
		var character = data.character;
		var target = data.target;
		var location = data.location;
		var item = this.RetrieveItemInfo(data.itemID);
		if (character.channelling == true) {
			return;
		}
		character.channelling = true;
		character.channellingAbility = this;
		data.io.to(data.game_uuid).emit(Event.output.knight.USE_ITEM_START, {"i":character.id, "t":item.id});
		setTimeout(function() {
			// Check if channelling has been cancelled
			if (character.channelling != true) {
				if (item.intByStun == true && character.channelling.indexOf("s") > -1) {
					return;
				}
				if (item.intByDamage == true && character.channelling.indexOf("d") > -1) {
					return;
				}
				if (item.intByAbilityUse == true && character.channelling.indexOf("a") > -1) {
					return;
				}
			}
			// Start effects of the item
			if (item.purpose == "H_Heal") {
				console.log("Health changed from " + character.hp + " to " + Math.min(Math.min(character.maxhp, character.hp + item.value), character.maxhp));
				character.hp = Math.min(Math.min(character.maxhp, character.hp + item.value), character.maxhp);
			}
			else if (item.purpose == "H_Regeneration") {
				var regen = setInterval(function() {
					console.log("Regeneration from " + character.hp + " to " +
						Math.min(Math.min(character.maxhp, character.hp + (item.value / item.duration)), character.maxhp) + ".");
					character.hp = Math.min(Math.min(character.maxhp, character.hp + (item.value / item.duration)), character.maxhp);
				}, 1000);
				setTimeout(function() {
					clearInterval(regen);
				}, item.duration * 1000);
			}
			else if (item.purpose == "Resurrect") {
				// Location of knight using the item
				var curLocation = character.position;
				for (var i = 0, charactersLength = characters.length; i < charactersLength; i++) {
					// Can't revive self or non-knights
					if (character.id = characters[i] || characters[i].type != "knight" || !characters[i].isDead()) {
						return;
					}
					// Location of knight to be revived
					var knightLocation = characters[i].position;
					if (Vec2.distanceTo(curLocation, knightLocation) < item.range) {
						// Convert the percentage to a decimal of item value and multiply it by maxhp to revive character
						characters[i].hp += characters[i].maxhp * (item.value / 100);
					}
				}
			}
			else if (item.purpose == "I_Ranged") {
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
					if (Vec2.distanceTo(curLocation, newLocation) < item.range) {
						return;
					}
					// Narrow Phase
					target -= curLocation;
					target = Vec2.add(Vec2.setLength({x: target.x + i, y: target.y + i}, 30), curLocation);
					if (Vec2.pointCollision(curLocation, newLocation, target)) {
						characters[i].hp -= item.value;
					}
				}
			}
			data.io.to(data.game_uuid).emit(Event.output.knight.USE_ITEM_END, {"i":character.id});
			// Decrement item count by one
			data.slot[1] -= 1;
			// Character has stopped channelling if it was channelling prior
			character.channelling = false;
		}, item.consumeTime * 1000);
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
	},
	RetrieveItemInfo: function (id) {
		var item = null;
		// Search for the item id
		for (var i = 0; i < Items.length; i++) {
			if (id == Items[i].item_id) {
				item = Items[i];
			}
		}
		// Return item information
		var formattedItem = {};
		formattedItem.id = id;
		formattedItem.purpose = item.purpose;
		formattedItem.value = item.value;
		formattedItem.duration = item.duration;
		formattedItem.consumeTime = item.consume_time;
		formattedItem.intByStun = item.interrupted_by_stun;
		formattedItem.intByDamage = item.interrupted_by_damage;
		formattedItem.intByAbilityUse = item.interrupted_by_ability_use;
		formattedItem.intByMovement = item.interrupted_by_move;
		formattedItem.range = item.range;
		return formattedItem;
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