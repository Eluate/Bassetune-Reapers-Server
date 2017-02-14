function MinPickStrategy() {
    //Return always min
    this.drawBetween = function(min, max) {
        return min;
    };

}
module.exports = MinPickStrategy;