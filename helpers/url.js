var Helper = require('../core/helper').Helper;

var URLHelper = Helper.extend({
    app: null,
    
    init: function(app) {
        this.app = app;
    },
    
    site: function(uri) {
        return '/' + uri;
    }
});

var instance = null;
URLHelper.get = function(app) {
    return instance || (instance = new URLHelper(app));
}

exports.URLHelper = exports.Helper = URLHelper;