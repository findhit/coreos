module.exports = function ( CoreOsManager ) {

    CoreOsManager.prototype.nodeList = function () {
        var nodes = this.configGet();
    };

};
