var Class = require('../core/class').Class;

Helper = Class.extend({
    app: null,
    
    init: function(app) {
        this.app = app;
    }
});

var helpers = {};

Helper.register = function(name, app) {
    if (!helpers[name]) {
        
        var H = helpers[name] = require('../helpers/' + name).Helper;
        var reg = {};
        if (H.isDynamic) {
            reg[name] = H.get;
            app.dynamicHelpers(reg);
        } else {
            reg[name] = H.get(app);
            app.locals(reg);
        }
    }
}

exports.Helper = Helper;