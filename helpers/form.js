var Helper = require('../core/helper').Helper;

var FormHelper = Class.extend({
    init: function(app) {
        this.app = app;
    },
    
    open: function(req) {
        return '<form method="post" action="' + req.url + '" enctype="multipart/form-data">';
    },
    
    close: function() {
        return '</form>';
    }
});

var instance = null;
FormHelper.get = function(app) {
    return instance || (instance = new FormHelper(app));
}

exports.FormHelper = exports.Helper = FormHelper;
