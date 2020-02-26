function SpiralCellPicker(height, width, barycenterRow, barycenterCol, cells, type) {
    this.originalCells = cells.slice(); //copia array cosi non lo modifico con l'ordinamento per peso
    this.cells = cells;
    this.type = (!type) ? "horizontal" : type; // { "horizontal", "vertical" }


    this.priv_isWest = function (cell) {
        return cell.col() < barycenterCol;
    };
    this.priv_isNorth = function (cell) {
        return cell.row() < barycenterRow;
    };
    this.priv_isEast = function (cell) {
        return cell.col() > barycenterCol;
    };
    this.priv_isSouth = function (cell) {
        return cell.row() > barycenterRow;
    };

    //var areRowsEven = height % 2 === 0 ? true : false;
    //var factor = areRowsEven ? 1 : 0;

    for (var i = 0; i < this.cells.length; i++) {
        var each = this.cells[i];
        var rowDiff = Math.abs(barycenterRow - each.row());
        var colDiff = Math.abs(barycenterCol - each.col());

        var circle = rowDiff >= colDiff ? rowDiff : colDiff;
        var diff = rowDiff + colDiff;
        var penalty = 0;

        if (this.priv_isWest(each)) penalty = (this.type === "horizontal") ? 1 : 3;
        if (this.priv_isEast(each)) penalty = (this.type === "horizontal") ? 2 : 4;
        if (this.priv_isNorth(each)) penalty = (this.type === "horizontal") ? 3 : 1;
        if (this.priv_isSouth(each)) penalty = (this.type === "horizontal") ? 4 : 2;


        each.weight = circle + "" + diff + "" + penalty;
        each.originalIndex = i;

        // console.log(each.row() + " " + each.col() + " " + weight);
    }


    //Ordino le celle in base al peso "prossimita dal centro" = distanza dal centro e dal bordo con priorita alla riga?    
    this.cells.sort(function (cell1, cell2) {
        var weightDiff = cell1.weight - cell2.weight;
        if (weightDiff != 0) return weightDiff;

        var rowDiff = cell1.row() - cell2.row();
        if (rowDiff !== 0) return rowDiff;
        return cell1.col() - cell2.col();
        /*
         var colDiff = cell1.col() - cell2.col();
         if (colDiff !== 0) return colDiff;
         return cell1.row() - cell2.row();
         */

    });


    //Pesco le celle in ordine di priorita
    this.draw = function () {
        if (this.cells.length === 0) return null;
        var selected = this.cells[0];
        this.cells.splice(selected, 1);

        this.originalCells.splice(selected.originalIndex, 1);
        return selected;
    };
}

module.exports = SpiralCellPicker;
