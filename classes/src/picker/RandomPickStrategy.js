function RandomPickStrategy() {

    this.drawBetween = function (min, max) {
        //https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

}

module.exports = RandomPickStrategy;