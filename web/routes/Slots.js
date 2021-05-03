var redisClient = require('../../global/RedisHandler').redisClient;
var mysqlConnection = require('../../global/MySQLHandler').connection;
var validSlotTypes = ["knight_slots", "ability_slots", "lord_slots"];

var Slots = function (req, res, next) {
    var uuid = req.body.uuid;
    var slotType = req.body.slotType;
    var itemSlot = parseInt(req.body.itemSlot, 10);
    var itemID = parseInt(req.body.itemID, 10);
    var itemTag = parseInt(req.body.itemTag, 10);
    var dungeonID = parseInt(req.body.dungeonID, 10);
    console.log(req.body);
    // Check if the slot type given is valid
    if (!validSlotTypes.some(function (validSlotType) {
        if (validSlotType == slotType) {
            return true;
        }
    })) {
        return;
    }
    // Check if account ID exists
    redisClient.hget(uuid, "accountID").then(function (account_id) {
        if (account_id == undefined) {
            res.send("Account ID is undefined.");
            return;
        }
        // Get purchased items and abilities
        mysqlConnection.query("SELECT item_id FROM br_purchases WHERE `account_id` = ? AND `item_id` = ?", [account_id, itemID], function (err, hasItem) //
        {
            if (itemID != 0 && (!hasItem || hasItem.length == 0)) {
                res.send("Invalid request.");
                return;
            }
            if (slotType == "knight_slots" && itemID != 0 && (itemSlot < 0 || itemSlot > 24 || !ItemType.isItem(itemID))) {
                res.send("Invalid request.");
                return;
            } else if (slotType == "lord_slots" && itemID != 0 && (itemSlot < 0 || itemSlot > 42 || dungeonID > 3 || dungeonID < 0 || (!ItemType.isLord(itemID) && !ItemType.isMinion(itemID) &&
                !ItemType.isLesserLord(itemID) && !ItemType.isTrap(itemID)))) {
                res.send("Invalid request.");
                return;
            } else if (slotType == "ability_slots" && itemID != 0 && ((itemSlot < 0 || itemSlot > 10) ||
                (!ItemType.isOffensiveAbility(itemID) && !ItemType.isDefensiveAbility(itemID)))) {
                res.send("Invalid request.");
                return;
            }

            if (slotType == "knight_slots") {
                mysqlConnection.query("INSERT INTO br_knight_slots (account_id, slot_id, item_id, item_tag) VALUES (?,?,?,?) "
                    + "ON DUPLICATE KEY UPDATE item_id = ?, item_tag = ?", [account_id, itemSlot, itemID, itemTag, itemID, itemTag], function (err, results) //
                {
                    if (err) {
                        res.send("Duplicates detected.");
                    } else {
                        res.send("Successfully Updated.");
                    }
                });
            } else if (slotType == "lord_slots") {
                redisClient.hget(uuid, "unlockedDungeons").then(function (unlockedDungeons) {
                    if (unlockedDungeons < dungeonID) {
                        return;
                    }
                    mysqlConnection.query("INSERT INTO br_lord_slots (account_id, slot_id, item_id, dungeon_id) VALUES (?,?,?,?) "
                        + "ON DUPLICATE KEY UPDATE item_id = ?", [account_id, itemSlot, itemID, dungeonID, itemID], function (err, results) //
                    {
                        if (err) {
                            res.send("Duplicates detected.");
                        } else {
                            res.send("Successfully Updated.");
                        }
                    });
                });
            } else if (slotType == "ability_slots") {
                mysqlConnection.query("INSERT INTO br_ability_slots (account_id, slot_id, item_id) VALUES (?,?,?) "
                    + "ON DUPLICATE KEY UPDATE item_id = ?", [account_id, itemSlot, itemID, itemID], function (err, results) //
                {
                    if (err) {
                        res.send("Duplicates detected.");
                    } else {
                        res.send("Successfully Updated.");
                    }
                });
            }
        });
    });
};

ItemType = {
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

module.exports = Slots;