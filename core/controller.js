var path = require('path');
var async = require('async');
var Class = require('../core/class').Class;

var Controller = Class.extend({
    name: '__root',
    __viewMap: {},
    __validation: {},
    
    app: null,
    
    init: function(app){
        this.app = app;
    },
    
    __register: function() {
        this.__route('');
        this.__route('index');
        this.__route('debug');
    },
    
    __route: function(orig, method, validation) {
        
        
        method = method || 'get';
        
        var url;
        if (orig[0] === '/') {
            url = orig;
        } else {
            url = '/' + this.name + ((orig === '') ? '' : '/' + orig);
        }
        var s = url.split('/');
        var fn = s[2] || 'index';
        validation = validation || this.__validation[fn] || null;
        
        //        console.log('--------: (' + this.name + ') (' + orig + ')');
        //        console.log('url     : ' + url);
        //        console.log('fn      : ' + fn);
        
        
        if (validation) {
            this.app.post(url, validation);
        }
        this.app[method](url, this.__handle(this));
    },
    
    __handle: function(controller) {
        
        return function(req, res, next) {
//            if (typeof req.form !== 'undefined') {
//                for(var i in req.form) {
//                    req.body[i] = req.form[i];
//                }
//            }


            if (req.method === 'POST') {
                req.isValid = true;
                if (typeof(req.form) !== 'undefined') {
                    for(var i in req.form) {
                        req.body[i] = req.form[i];
                    }
                        
                    if (!req.form.isValid) {
                        req.isValid = false;
                    }
                }
            }
            
            var key = controller.name + '/' + req.uri.fn;
            if (typeof(controller.__viewMap[key]) === 'undefined') {
                var testPath = [key, req.uri.fn];
                var exists = false;
                for (i in testPath) {
                    exists = path.existsSync(controller.app.settings.views + '/' + testPath[i] + '.html');
                    if (exists) {
                        controller.__viewMap[key] = testPath[i];
                        break;
                    }
                }
                controller.__viewMap[key] = testPath[i];
            }
            
            if(typeof(controller[req.uri.fn]) === 'function') {
                res.view = controller.__viewMap[key];
                req.controller = res.controller = controller;
                
                res.locals({
                    controller: controller,
                    req: req, 
                    res: res
                });
                controller[req.uri.fn](req, res, next);
            } else {
                next(new Error('Controller ' + controller.name + '/' + req.uri.fn + ' not found'));
                return;
            }
            
        }
        
    },
    
    debug: function(req, res, next) {
        res.locals({
            req: req,
            res: res
        });
        next();
    }
});

exports.Controller = Controller;