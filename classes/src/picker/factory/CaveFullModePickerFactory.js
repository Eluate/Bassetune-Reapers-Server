var CompositeCellPicker = require("../CompositeCellPicker.js");
var SpiralCellPicker = require("../SpiralCellPicker.js");
var NoDuplicateCellPicker = require("../NoDuplicateCellPicker.js");

function CaveFullModePickerFactory(isRoom, place, pickStrategy) {
    this.isRoom = isRoom;
    this.place = place;
    this.cells = this.place.walkableCells();
    this.pickStrategy = pickStrategy;
    
    this.pickerForKnights = null;
    this.pickerForDoor = null;
    this.pickerForCreatures = null;
    this.pickerForTraps = null;
    this.pickerForLesserLords = null;

    this.forKnights = function() {
        if (!this.pickerForKnights) {
            var height = this.place.height();
            var width = this.place.width();
            var barycenterRow = this.place.topLeftVertex().row() + Math.floor(height / 2);
            var barycenterCol = this.place.topLeftVertex().col() + Math.floor(width / 2);
            this.pickerForKnights = new SpiralCellPicker(height, width, barycenterRow, barycenterCol, this.cells);
        }
        return this.pickerForKnights;
    };

    this.forLords = function() {
        //return new NoDuplicateCellPicker(this.cells, this.pickStrategy);
        return null;
    };

    this.forLesserLords = function() {
        if (!this.pickerForLesserLords) {
            var height = this.place.height();
            var width = this.place.width();
            var barycenterRow = this.place.topLeftVertex().row() + Math.floor(height / 2);
            var barycenterCol = this.place.topLeftVertex().col() + Math.floor(width / 2);
            this.pickerForLesserLords = new SpiralCellPicker(height, width, barycenterRow, barycenterCol, this.cells);
        }
        return this.pickerForLesserLords;
    };

    this.forTraps = function() {
        if (!this.pickerForTraps) {
            if (!this.isRoom) {
                this.pickerForTraps = new NoDuplicateCellPicker(this.cells, this.pickStrategy);
            } else {
                var compositePicker = new CompositeCellPicker(this.pickStrategy);

                var height = this.place.height();
                var width = this.place.width();
                
                var facingCells = this.place.absCellsFacingIncoming();
                var size = facingCells.length;
                //console.log("FullCaveModePickerFactory: "+ this.label + " Facing Inc: " + size);
                if (size != 0) {
                    var middle = Math.ceil(size / 2) - 1;
                    var baryCell = facingCells[middle];
                    var barycenterRow = baryCell.row();
                    var barycenterCol = baryCell.col();
                    compositePicker.addPicker(new SpiralCellPicker(height, width, barycenterRow, barycenterCol, this.cells));
                }

                var facingCells = this.place.absCellsFacingOutcoming();
                var size = facingCells.length;
                //console.log("FullCaveModePickerFactory: "+ this.label + " Facing Out: " + size);
                if (size != 0) {
                    var middle = Math.ceil(size / 2) - 1;
                    var baryCell = facingCells[middle];
                    var barycenterRow = baryCell.row();
                    var barycenterCol = baryCell.col();
                    compositePicker.addPicker(new SpiralCellPicker(height, width, barycenterRow, barycenterCol, this.cells));
                }
                this.pickerForTraps = compositePicker;
            }
        }
        return this.pickerForTraps;
    };

    this.forCreatures = function() {
        if (!this.pickerForCreatures) {
            this.pickerForCreatures = new NoDuplicateCellPicker(this.cells, this.pickStrategy);
        }
        return this.pickerForCreatures;
    };

    this.forLordDoor = function() {
        if (!this.pickerForDoor) {
            //this.pickerForDoor = new DoorCellPicker(this.place, this.pickStrategy);
            var height = this.place.height();
            var width = this.place.width();
            var barycenterRow = this.place.topLeftVertex().row() + Math.floor(height / 2);
            var barycenterCol = this.place.topLeftVertex().col() + Math.floor(width / 2);
            this.pickerForDoor = new SpiralCellPicker(height, width, barycenterRow, barycenterCol, this.cells);
        }
        return this.pickerForDoor;
    };
} 

module.exports = CaveFullModePickerFactory;
