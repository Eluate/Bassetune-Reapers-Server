var DungLordModePickerFactory = require("../factory/DungLordModePickerFactory.js");
var DungFullModePickerFactory = require("../factory/DungFullModePickerFactory.js");

function DungPickerFactorySelector() {
    
    this.forRoom = function(isDungeonMode, place, pickerStrategy) {
        if (isDungeonMode) {
            var isRoom = true;
            return new DungFullModePickerFactory(isRoom, place, pickerStrategy);
        } else {
            return new DungLordModePickerFactory(place, pickerStrategy);
        }
    };

    this.forCorridor = function(isDungeonMode, place, pickerStrategy) {
        var isRoom = false;
        return new DungFullModePickerFactory(isRoom, place, pickerStrategy);
    };
} 

module.exports = DungPickerFactorySelector;
