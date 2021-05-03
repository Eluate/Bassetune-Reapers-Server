var mysqlConnection = require('../../global/mysqlHandler').connection;
var redisClient = require("../../global/redisHandler").redisClient;

var getInventory = function (req, res, next) {
    if (req.body.uuid == undefined) {
        res.send("Logged off. Login again.");
        return;
    }
    var uuid = req.body.uuid;

    redisClient.hget(uuid, "accountID").then(function (account_id) {
        if (account_id != undefined) {
            mysqlConnection.query("(SELECT item_id, slot_id, null as item_tag, dungeon_id FROM br_lord_slots WHERE account_id = ?) UNION " +
                "(SELECT item_id, slot_id, item_tag, null FROM br_knight_slots WHERE account_id = ?) UNION " +
                "(SELECT item_id, null, null, null FROM br_purchases WHERE account_id = ?) UNION " +
                "(SELECT item_id, slot_id, null, null FROM br_ability_slots WHERE account_id = ?)", [account_id, account_id, account_id, account_id], function (err, itm_results) //
            {
                if (err) {
                    return;
                }

                var purchases = [];
                var abilities = [];
                var knightItems = [];
                var lordItems = [];
                for (var i = 0; i < itm_results.length; i++) {
                    if (itm_results[i].item_id == null)
                        continue;

                    if (itm_results[i].slot_id == null) {
                        purchases.push(itm_results[i].item_id);
                    } else if (itm_results[i].dungeon_id == null && itm_results[i].item_tag == null) {
                        abilities.push([itm_results[i].item_id, itm_results[i].slot_id]);
                    } else if (itm_results[i].item_tag == null) {
                        lordItems.push([itm_results[i].item_id, itm_results[i].slot_id, itm_results[i].dungeon_id]);
                    } else {
                        knightItems.push([itm_results[i].item_id, itm_results[i].slot_id, itm_results[i].item_tag]);
                    }
                }

                // Find maximum dungeon count without another query by searching purchases
                var dungeonCount = 1;
                for (var i = 0; i < purchases.length; i++) {
                    if (purchases[i] >= 10000 && purchases[i] < 10010 && purchases[i] - 9998 > dungeonCount) {
                        dungeonCount = purchases[i] - 9998
                    }
                }

                if (itm_results) {
                    req.inventory = {
                        knight: knightItems,
                        ability: abilities,
                        lord: lordItems,
                        purchased: purchases,
                        count: dungeonCount
                    };
                    next();
                } else {
                    res.send("Unable to retrieve inventory.");
                }
            });
        } else {
            res.send("Unable to retrieve inventory.");
        }
    });
};

module.exports = getInventory;