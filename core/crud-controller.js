var Controller = require('../core/controller').Controller;
var Model = require('../core/model').Model;
var async = require('async');

var CrudController = Controller.extend({
    name: '__crud',
    
    __register: function() {
        this.__route('listing/:offset?');
        this.__route('add', 'all');
        this._super();
    },
    
    __gridOptions: function(fields) {
        var f = [], ff = [], fa = [];
        
        fields = fields || [];
        
        for(var i in fields) {
            f.push(fields[i].name);
            
            switch(fields[i].fieldType) {
                case 12:
                    ff.push('datetime.formatShortDatetime');
                    break
                default:
                    ff.push('');
            }
            
            switch(fields[i].fieldType) {
                case 3:
                    fa.push('right');
                    break
                default:
                    fa.push('');
            }
        }
        return {
            fields: f,
            formats: ff,
            aligns: fa,
            limit: 5,
            actions: {
                'edit': this.name + '/edit',
                'delete': this.name + '/delete'
            }
        };
    },
    
    index: function(req, res) {
        res.redirect('/' + req.uri.segments[1] + '/listing');
    },
    
    listing: function(req, res, next) {
        var model = Model.get(req.controller.name, req.app);
        var offset = req.params.offset || 0;
        var limit = 5;
        model.listing(offset, limit, function(err, results, fields, rowCount) {
            err && next(err);
            
            var gridOptions = req.controller.__gridOptions(fields);
            gridOptions.offset = offset;
            gridOptions.limit = limit;
            gridOptions.results = results;
            gridOptions.rowCount = rowCount;
            res.local('gridOptions', gridOptions);
            next();
        });
    },
    
    add: function(req, res, next) {
        var model = Model.get(req.controller.name, req.app);
        
        if (req.form && req.form.isValid) {
            delete req.form['_'];
            model.save(req.form, function(err, info) {
                err && next(err);
                
                req.flash('info', 'Adding ' + req.controller.name + ' success');
                res.redirect('/' + req.controller.name + '/listing');
                return;
            });
        } else {
            model.fields(function(err, fields) {
                err && next(err);
                
                res.local('fields', fields);
                next();
            });
        }
        
    }
});

exports.CrudController = CrudController;