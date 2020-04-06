var Inventory = function (req, res, next) {
    res.send(JSON.stringify(req.inventory));
};

module.exports = Inventory;