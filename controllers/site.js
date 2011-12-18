var Controller = require('../core/controller').Controller;

var Site = Controller.extend({
    name: 'site',
    
    __register: function () {
        this.__route('/');     
        this.__route('/site/huer');
        this._super();
    },
    
    index: function(req, res, next) {
        next();
    }
});

exports.Site = Site;

exports.register = function(app) {
    var site = new Site(app);
    site.__register();
};