/*
* Users can buy and sell items through this module
* - knight items and boss items
* */

var mysqlConnection = require('../../global/mysqlHandler').connection;
var redisClient = require("../../global/redisHandler").redisClient;
var dateFormatter = require('../modules/DateFormatter').toMysqlFormat;

var ItemShop = function (req, res) {
    var uuid = req.body.uuid;

    // The item wanting to be purchased
    var itemID = parseInt(req.body.item);
    if (isNaN(itemID)) {
        res.send("Invalid item id specified.");
        return;
    }

    redisClient.hgetall(uuid).then(function (account) {
        // Invalid or old uuid given
        if (!account) {
            return;
        }

        // Set variables used in next steps
        var accountID = account.accountID;
        var gold = account.gold;
        var knightLevel = account.knightLevel;
        var lordLevel = account.lordLevel;

        // Variables from redis didn't exist, return
        if (!accountID || !gold) {
            return;
        }
        // TODO: Implement required level
        if (req.body.commandType == "Buy") {
            mysqlConnection.query("SELECT `unlock_price`, `required_level` FROM `br_items` WHERE `item_id` = ?", [itemID], function (err, itm_results) //
            {
                // An error occurred trying to retrieve the item id from the database
                if (err || itm_results.length < 1 || !itm_results[0]) {
                    res.send("An error occurred.");
                    return;
                }

                // Check if the player is a high enough level to purchase the item
                if (isKnightSide(itemID) && knightLevel < itm_results[0].required_level) {
                    return;
                } else if (isLordSide(itemID) && lordLevel < itm_results[0].required_level) {
                    return;
                }

                // Set the total cost
                var totalCost = itm_results[0].unlock_price;
                // Check if the user has enough money to buy the items (quantity included)
                if (gold >= totalCost) {
                    var purchaseDate = dateFormatter(new Date()); // Convert given date to the MySQL format
                    // Update redis
                    redisClient.hincrby(uuid, "gold", totalCost * -1);
                    // Update gold in MySQL
                    mysqlConnection.query("UPDATE `br_player` SET `gold` = `gold` - ? WHERE account_id = ?", [totalCost, accountID], function (err, results) {
                        // Updated gold
                    });
                    // Add item to purchases
                    mysqlConnection.query("INSERT INTO `br_purchases` (account_id, item_id, purchase_date) VALUES (?, ?, ?)", [accountID, itemID, purchaseDate], function (err, results) {
                        res.send("Successfully Purchased.");
                        if (err) {
                            // Restore gold if error inserting
                            redisClient.hincrby(uuid, "gold", totalCost);
                            // Update gold in MySQL
                            mysqlConnection.query("UPDATE `br_player` SET `gold` = `gold` + ? WHERE account_id = ?", [totalCost, accountID], function (err, results) {
                                // Updated gold
                            });

                        }
                    });
                } else {
                    res.send("Not enough gold.");
                }
            });
        } else {
            res.send("Command Type Invalid.");
        }
    });
};

var isLordSide = function (itemID) {
    if ((itemID >= 3000 && itemID < 4000) || (itemID >= 10000 && itemID < 10010)) {
        return true;
    }
    return false;
};

var isKnightSide = function (itemID) {
    if (itemID >= 1000 && itemID < 3000) {
        return true;
    }
    return false;
};


module.exports = ItemShop;