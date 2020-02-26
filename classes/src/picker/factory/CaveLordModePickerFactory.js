var CompositeCellPicker = require("../CompositeCellPicker.js");
var SpiralCellPicker = require("../SpiralCellPicker.js");
var NoDuplicateCellPicker = require("../NoDuplicateCellPicker.js");

function CaveLordModePickerFactory(place, pickStrategy, excludeCellNextToWall) {
    this.place = place;
    this.cells = this.place.walkableCells(excludeCellNextToWall);
    this.pickStrategy = pickStrategy;

    this.pickerForKnights = null;
    this.pickerForLords = null;

    this.cards = ["EAST", "SOUTH", "WEST", "NORTH"];
    this.selectedCardIndex = -1;

    this.forKnights = function () {
        if (!this.pickerForKnights) {
            this.pickerForKnights = this.priv_createPicker();
        }
        return this.pickerForKnights;
    };

    this.forLords = function () {
        if (!this.pickerForLords) {
            this.pickerForLords = this.priv_createPicker();
        }
        return this.pickerForLords;
    };

    this.priv_createPicker = function () {
        var selectedCard = null;
        if (this.selectedCardIndex !== -1) { //Seleziona la cardinalita opposta
            var index = (this.selectedCardIndex + 2) % 4;
            selectedCard = this.cards[index];
        } else {
            this.selectedCardIndex = this.pickStrategy.drawBetween(0, 3);
            selectedCard = this.cards[this.selectedCardIndex];
        }
        var height = this.place.height();
        var width = this.place.width();
        var barycenterRow = null;
        var barycenterCol = null;
        var type = null;
        if (selectedCard === "EAST") {
            var vertex = this.place.topRightVertex();
            barycenterRow = vertex.row() + Math.floor(height / 2);
            barycenterCol = vertex.col();
            type = "vertical";
        } else if (selectedCard === "SOUTH") {
            var vertex = this.place.bottomLeftVertex();
            barycenterRow = vertex.row();
            barycenterCol = vertex.col() + Math.floor(width / 2);
            type = "horizontal";
        } else if (selectedCard === "WEST") {
            var vertex = this.place.topLeftVertex();
            barycenterRow = vertex.row() + Math.floor(height / 2);
            barycenterCol = vertex.col();
            type = "vertical";
        } else if (selectedCard === "NORTH") {
            var vertex = this.place.topLeftVertex();
            barycenterRow = vertex.row();
            barycenterCol = vertex.col() + Math.floor(width / 2);
            type = "horizontal";
        }
        return new SpiralCellPicker(height, width, barycenterRow, barycenterCol, this.cells, type);
    };

    this.forLesserLords = function () {
        return null;
    };

    this.forTraps = function () {
        return null;
    };

    this.forCreatures = function () {
        return null;
    };

    this.forLordDoor = function () {
        return null;
    };
}

module.exports = CaveLordModePickerFactory;
