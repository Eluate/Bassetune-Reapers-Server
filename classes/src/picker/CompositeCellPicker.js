function CompositeCellPicker(pickerSelectionStrategy) {
    this.pickers = new Array();
    this.pickerSelectionStrategy = pickerSelectionStrategy;
    
    this.addPicker = function(aPicker) {
        this.pickers.push(aPicker);
    }

    //Pesco le celle in ordine di priorita
    this.draw = function() {
        var max = this.pickers.length - 1;
        if (max === -1) return null;
        
        var index = this.pickerSelectionStrategy.drawBetween(0, max);
        var selected = this.pickers[index];
        return selected.draw();
    };
} 

module.exports = CompositeCellPicker;
