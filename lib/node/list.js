module.exports = function ( CoreOsAzure ) {

    CoreOsAzure.prototype.nodeList = function () {
        var nodes = this.configGet();
    };

};
