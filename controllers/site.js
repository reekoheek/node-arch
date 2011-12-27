var Controller = require('../core/controller').Controller;

var Site = Controller.extend({
    name: 'site',
    
    __register: function () {
        this.app.get('/', this.__handle(this));
        this._super();
    },
    
    index: function() {
        this.next();
    }
});

exports.Site = Site;

exports.register = function(app) {
    var site = new Site(app);
    site.__register();
};