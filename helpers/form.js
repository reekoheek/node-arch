var Helper = require('../core/helper').Helper;

var FormHelper = Helper.extend({
    init: function(app) {
        this.app = app;
    },
    
    open: function(req, multipart) {
        return '<form method="post" action="' + req.url + '"' + ((multipart) ? 'enctype="multipart/form-data"' : '') + '>';
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
