var Helper = require('../core/helper').Helper;

var FrameworkHelper = Helper.extend({
    app: null,
    
    init: function(app) {
        this.app = app;
    },
    
    format: function(data, format) {
        var formatArray = format.split('.');
        if (!format) {
            return data;
        }
        if (this.app.dynamicViewHelpers[formatArray[0]]) {
            return this.app.dynamicViewHelpers[formatArray[0]];
        } else {
            return this.app._locals[formatArray[0]][formatArray[1]](data);
        }
    },
    
    debug: function(data) {
        return '<pre class="-debug">' + util.inspect(data) + '</pre>';
    }
});

var instance = null;
FrameworkHelper.get = function(app) {
    return instance || (instance = new FrameworkHelper(app));
}

exports.FrameworkHelper = exports.Helper = FrameworkHelper;
