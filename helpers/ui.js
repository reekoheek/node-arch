var Helper = require('../core/helper').Helper;

var UIHelper = Helper.extend({
    req: null,
    res: null,
    basePath: null,
    
    init: function(req, res) {
        this.app = req.app;
        this.req = req;
        this.res = res;
        
        var vsegments = res.view.split('/');
        this.basePath = '';
        for(var i = vsegments.length; i > 1; i--) {
            this.basePath += '../';
        }
        
    },
    
    grid: function(partial, options) {
        return partial(this.basePath + 'components/grid', {
            options: options
        });
    },
    
    flash: function(name) {
        var messages = this.req.flash(name);
        if (messages.length == 0) return '';
        var s = '<div class="' + name + '">\n';
        for (var i in messages) {
            s += '<p>' + messages[i] + '</p>\n';
        }
        s += '</div>\n';
        return s;
    },
    
    pagination: function(options) {
        var limit = parseInt(options.limit);
        var offset = parseInt(options.offset);
        var rowCount = parseInt(options.rowCount);
        var uri = '/' + this.req.uri.segments[1] + '/' + this.req.uri.fn;
        
        //        var lis = [];
        
        var prev = offset - limit;
        if (prev < 0) prev = 0;
        
        var next = offset + limit;
        if (next >= rowCount) next = Math.floor(rowCount / limit) * limit;
        
        
        var s = '<ul class="pagination">' + 
        //            '<li class="first"><a href="#"><<</a></li>' +
        '<li class="first"><a href="' + uri + '/' + prev + '"><</a></li>' +
        '<li class="last"><a href="' + uri + '/' + next + '">></a></li>' +
        //            '<li class="last"><a href="#">>></a></li>' +
        '</ul>';
        
        return s;
    }
});

UIHelper.isDynamic = true;
UIHelper.get = function(req, res) {
    return new UIHelper(req, res);
}

exports.UIHelper = exports.Helper = UIHelper;