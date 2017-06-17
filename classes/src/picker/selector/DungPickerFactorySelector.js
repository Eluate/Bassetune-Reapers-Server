var DungLordModePickerFactory = require("../factory/DungLordModePickerFactory.js");
var DungFullModePickerFactory = require("../factory/DungFullModePickerFactory.js");

function DungPickerFactorySelector() {
    
    this.forRoom = function(isDungeonMode, place, pickerStrategy, excludeCellNextToWall) {
        if (isDungeonMode) {
            var isRoom = true;
            return new DungFullModePickerFactory(isRoom, place, pickerStrategy, excludeCellNextToWall);
        } else {
            return new DungLordModePickerFactory(place, pickerStrategy, excludeCellNextToWall);
        }
    };

    this.forCorridor = function(isDungeonMode, place, pickerStrategy, excludeCellNextToWall) {
        var isRoom = false;
        return new DungFullModePickerFactory(isRoom, place, pickerStrategy, excludeCellNextToWall);
    };
} 

module.exports = DungPickerFactorySelector;
