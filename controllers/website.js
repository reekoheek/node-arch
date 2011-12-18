var CrudController = require('../core/crud-controller').CrudController;

var form = require('express-form').configure({
    autoTrim: true, 
    passThrough: true,
    autoLocals: false,
    dataSources: ['body']
});
var filter = form.filter;
var validate = form.validate;


var Website = CrudController.extend({
    name: 'website',
    
    __validation: {
        'add': form(
            filter('url').trim(),
            validate('url', 'URL').required().isUrl()
            )
    }
});

exports.Website = Website;

exports.register = function(app) {
    new Website(app).__register();
};