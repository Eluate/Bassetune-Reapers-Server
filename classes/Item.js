/*
 Class for item usage
 */
var Vec2 = require("./Vector2");
var Items = require('./resources/items');
var Event = require('./EventEnum');
var Effects = require('./Effect');

var Item = {
    UseItem: function (data) {
        // Variables are characters, character, location and target
        var characters = data.characters;
        var character = data.character;
        var target = data.target;
        var item = this.RetrieveItemInfo(data.slot[0]);

        if (!item) return;

        // Overwrite any abilities/items being channelled
        character.channelling = item;
        data.io.to(data.game_uuid).emit(Event.output.knight.USE_ITEM_START, {"i": character.id, "t": item.id});
        setTimeout(function () {
            var Effect = new Effects(data);
            // Check if channelling has been cancelled
            if (character.channelling != item) return;
            if (item.purpose == "H_Status") {
                Effect.Purge(character, item);
            }
            if (character.stunned()) return;
            // Start effects of the item
            if (item.purpose == "H_Heal") {
                Effect.Heal(character, item);
            } else if (item.purpose == "H_Regeneration") {
                Effect.Regeneration(character, item);
            } else if (item.purpose == "Resurrect") {
                // Location of knight using the item
                var curLocation = character.position;
                for (var i = 0, charactersLength = characters.length; i < charactersLength; i++) {
                    // Can't revive self or non-knights
                    if (character.id = characters[i].id || characters[i].type != "knight" || !characters[i].isDead()) {
                        return;
                    }
                    // Location of knight to be revived
                    var knightLocation = characters[i].position;
                    if (Vec2.distanceTo(curLocation, knightLocation) < item.range) {
                        // Convert the percentage to a decimal of item 	value and multiply it by maxhp to revive character
                        characters[i].hp = 0;
                        characters[i].hp += characters[i].maxhp * (item.value / 100);
                    }
                }
            }
            data.io.to(data.game_uuid).emit(Event.output.knight.USE_ITEM_END, {"i": character.id});
            // Decrement item count by one
            data.slot[1] -= 1;
            // Character has stopped channelling if it was channelling prior
            character.channelling = false;
        }, item.consumeTime * 1000);
    },
    RetrieveItemInfo: function (id) {
        var item = null;
        // Search for the item id
        for (var i = 0; i < Items.length; i++) {
            if (id == Items[i].item_id) {
                item = Items[i];
            }
        }

        if (!item) return;

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
 */

Item.ItemType = {
    isKnight: function (itemID) {
        return itemID == 0 || itemID == 1;
    },
    isItem: function (itemID) {
        return !(itemID < 1000 || itemID >= 2500);
    },
    isConsumable: function (itemID) {
        return !(itemID < 1000 || itemID >= 2400);
    },
    isAmmo: function (itemID) {
        return !(itemID < 1900 || itemID >= 2000);
    },
    isWeapon: function (itemID) {
        return !(itemID < 2000 || itemID >= 2400);
    },
    isArmor: function (itemID) {
        return !(itemID < 2400 || itemID >= 2500);
    },
    isLord: function (itemID) {
        return !(itemID < 3000 || itemID >= 3200);
    },
    isLesserLord: function (itemID) {
        return !(itemID < 3200 || itemID >= 3400);
    },
    isMinion: function (itemID) {
        return !(itemID < 3400 || itemID >= 3600);
    },
    isTrap: function (itemID) {
        return !(itemID < 3600 || itemID >= 3800);
    },
    isOffensiveAbility: function (itemID) {
        return !(itemID < 2500 || itemID >= 2750);
    },
    isDefensiveAbility: function (itemID) {
        return !(itemID < 2750 || itemID >= 3000);
    }
};

module.exports = Item;