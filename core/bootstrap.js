var express = require('express');
var fs = require('fs');
var path = require('path');
var Helper = require('../core/helper').Helper;

require('./inflection');
require('./date-format');

var app = express.createServer();
var context = null;

var allFiles = function(dir, cb, filter) {
    filter = filter || /\.js$/;
    var files = fs.readdirSync(dir);
    for(i in files) {
        if (files[i].match(filter)) {
            var name = files[i].replace(filter, '');
            var requirePath = dir + '/' + name;
            cb(name, requirePath);
        }
    }
}

var fetchConfig = function() {
    var dir = __dirname + '/../config';
    var exists = path.existsSync(dir);
    if (exists) {
        allFiles(dir, function(name, requirePath) {
            var config = require(requirePath);
            for (var i in config) {
                var cfg = app.settings[i] || {};
                for(j in config[i]) {
                    cfg[j] = config[i][j];
                }
                app.set(i, cfg);
            }
        });
    }
        
    dir = __dirname + '/../config/' + app.settings.env;
    path.existsSync(dir);
    if (exists) {
        allFiles(dir, function(name, requirePath) {
            var config = require(requirePath);
            for (var i in config) {
                var cfg = app.settings[i] || {};
                for(j in config[i]) {
                    cfg[j] = config[i][j];
                }
                app.set(i, cfg);
            }
        });
    }
}

var prepareURI = function(req, res, next) {
    var segments = req.url.split('/');
    var fn = (typeof(segments[2]) === 'undefined' || segments[2] === '') ? 'index' : segments[2];
    
    req.uri = {
        segments: segments,
        fn: fn
    };
    next();
}

var fetchHelper = function() {
    allFiles(__dirname + '/../helpers', function(name) {
        Helper.register(name, app);
    });
}

exports.bootstrap = function() {
    
    // Configuration
    app.configure(function(){
        
        fetchConfig();
        
        app.locals(app.settings.locals);
        
        app.use(prepareURI);
        
        fetchHelper();
    
        app.register('.html', require('ejs'));        
        app.set('views', __dirname + '/../views');
        app.set('view engine', 'html');
    
        app.use(express.cookieParser());
        app.use(express.session({
            secret: 'qwertyuioplkjhgfdsazxcvbnm'
        }));
        
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(__dirname + '/../public'));
        
        app.use(function(req, res, next) {
            if (typeof(res.view) === 'undefined') {
                next();
            } else {
                res.render(res.view);
            }
        });
    });

    app.configure('development', function(){        
        app.use(express.errorHandler({
            dumpExceptions: true, 
            showStack: true
        })); 
    });

    app.configure('production', function(){
        app.use(express.errorHandler()); 
    });
    
    allFiles(__dirname + '/../controllers', function(name) {
        require('../controllers/' + name).register(app);
    });

    app.listen(app.settings.config.port);
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
    
    return app;
}