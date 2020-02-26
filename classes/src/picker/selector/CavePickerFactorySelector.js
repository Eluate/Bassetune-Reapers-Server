var LordCaveModePickerFactory = require("../factory/CaveLordModePickerFactory.js");
var FullCaveModePickerFactory = require("../factory/CaveFullModePickerFactory.js");

function CavePickerFactorySelector() {
    this.forRoom = function (isDungeonMode, place, pickerStrategy, excludeCellNextToWall) {
        if (isDungeonMode) {
            var isRoom = true;
            return new FullCaveModePickerFactory(isRoom, place, pickerStrategy, excludeCellNextToWall);
        } else {
            return new LordCaveModePickerFactory(place, pickerStrategy, excludeCellNextToWall);
        }
    };

    this.forCorridor = function (isDungeonMode, place, pickerStrategy, excludeCellNextToWall) {
        var isRoom = false;
        return new FullCaveModePickerFactory(isRoom, place, pickerStrategy, excludeCellNextToWall);
    };
}

module.exports = CavePickerFactorySelector;
