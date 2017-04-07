var LordCaveModePickerFactory = require("../factory/CaveLordModePickerFactory.js");
var FullCaveModePickerFactory = require("../factory/CaveFullModePickerFactory.js");

function CavePickerFactorySelector() {
    
    this.forRoom = function(isDungeonMode, place, pickerStrategy) {
        if (isDungeonMode) {
            var isRoom = true;
            return new FullCaveModePickerFactory(isRoom, place, pickerStrategy);
        } else {
            return new LordCaveModePickerFactory(place, pickerStrategy);
        }
    };

    this.forCorridor = function(isDungeonMode, place, pickerStrategy) {
        var isRoom = false;
        return new FullCaveModePickerFactory(isRoom, place, pickerStrategy);
    };
} 

module.exports = CavePickerFactorySelector;
