var path = require('path');
var async = require('async');
var Class = require('../core/class').Class;
var form = require('express-form').configure({
    autoTrim: true, 
    passThrough: true,
    autoLocals: false,
    dataSources: ['body']
});
var filter = form.filter;
var validate = form.validate;

var Controller = Class.extend({
    name: '__root',
    __viewMap: {},
    __validation: {},
    
    app: null,
    
    init: function(app){
        this.app = app;
    },
    
    __register: function() {
        this.__routeValidation();
        this.__routeAll();
    },
    
    __routeValidation: function() {
        for(var i in this.__validation) {
            var actions = i.split('|');
            
            var formRules = [];
            
            for (var j in this.__validation[i]) {
                var valRule = this.__validation[i][j];
                
                var label = j, rules;
                
                if (typeof valRule === 'string') {
                    rules = valRule;
                } else {
                    valRule[1] && (label = valRule[1]);
                    rules = valRule[0];
                }
                
                rules = rules.split('|');
                
                var filterRule = null;
                var validateRule = null;
                
                for(var k in rules) {
                    var v = rules[k].trim();
                    
                    if (v.substr(0, 2) == 'f:') {
                        filterRule || (filterRule  = filter(j));
                        filterRule = filterRule[v.substr(2)].apply(filterRule);
                    } else {
                        validateRule || (validateRule = validate(j, label));
                        
                        var r = v.match(/^([a-zA-Z0-9]+)(\((.*)\))*$/);
                        var fn = r[1], args;
                        
                        r[3] && (args = r[3].split(','));
                        validateRule = validateRule[fn].apply(validateRule, args);
                    }
                }
                
                filterRule && formRules.push(filterRule);
                validateRule && formRules.push(validateRule);
                
            }

            for(var j in actions) {
                this.app.post(new RegExp('^\\/' + this.name + '/' + actions[j]), form.apply(null, formRules));
            }
        }
    },
    
    __routeAll: function() {
        this.app.all(new RegExp('^\\/' + this.name), this.__handle(this));
    },
    
    __handle: function(controller) {
        
        return function(req, res, next) {
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
            
            if(typeof(controller[req.uri.fn]) === 'function' && controller[req.uri.fn][0] !== '_'  && controller[req.uri.fn] !== 'init' && controller[req.uri.fn] !== 'constructor') {
                res.view = controller.__viewMap[key];
                req.controller = res.controller = controller;
                
                res.locals({
                    controller: controller,
                    req: req, 
                    res: res
                });
                res.next = next;
                
                controller[req.uri.fn].apply(res, req.uri.segments.slice(3));
            } else {
                var error = new Error('Controller "/' + controller.name + '/' + req.uri.fn + '" not found');
                error.is404 = true;
                next(error);
                return;
            }
            
        }
        
    },
    
    debug: function() {
        this.next();
    }
});

exports.Controller = Controller;