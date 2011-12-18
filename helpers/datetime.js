var Helper = require('../core/helper').Helper;

var DatetimeHelper = Helper.extend({
    
    formatShortDatetime: function(date, format) {
        return date.format('dd-mm-yyyy HH:MM:ss');
    }
    
});

var instance = null;
DatetimeHelper.get = function(app) {
    return instance || (instance = new DatetimeHelper(app));
}

exports.DatetimeHelper = exports.Helper = DatetimeHelper;
