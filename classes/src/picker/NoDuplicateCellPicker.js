function NoDuplicateCellPicker(cellArray, pickStrategy) {
    this.cells = cellArray;
    this.pickStrategy = pickStrategy;

    this.draw = function () {
        index = pickStrategy.drawBetween(0, this.cells.length - 1);
        selected = this.cells[index];
        this.cells.splice(index, 1);
        return selected;
    };
}

module.exports = NoDuplicateCellPicker;
