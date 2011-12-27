var CrudController = require('../core/crud-controller').CrudController;


var Website = CrudController.extend({
    name: 'website',
    
    __validation: {
        'add|edit': {
            'url': ['f:trim|required|isUrl', 'URL']
        }
    }
});

exports.Website = Website;

exports.register = function(app) {
    new Website(app).__register();
};