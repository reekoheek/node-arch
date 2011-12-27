var Controller = require('../core/controller').Controller;
var Model = require('../core/model').Model;
var async = require('async');

var CrudController = Controller.extend({
    name: '__crud',
    
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
                'delete': this.name + '/remove'
            }
        };
    },
    
    index: function() {
        this.redirect('/' + this.req.uri.segments[1] + '/listing');
    },
    
    listing: function(offset) {
        var res = this;
        
        offset = offset || '0';        
        if (isNaN(offset)) { 
            this.redirect(this.req.uri.segments.slice(0, 3).join('/'));
            return;
        }
        
        var model = Model.get(this.controller.name, this.app);
        var limit = 5;
        model.listing(offset, limit, function(err, results, fields, rowCount) {
            if (err) {res.next(err); return; }
            
            var gridOptions = res.controller.__gridOptions(fields);
            gridOptions.offset = offset;
            gridOptions.limit = limit;
            gridOptions.results = results;
            gridOptions.rowCount = rowCount;
            res.local('gridOptions', gridOptions);
            res.next();
        });
    },
    
    add: function() {
        var res = this;
        
        var model = Model.get(this.controller.name, this.app);
        
        if (this.req.isValid) {
            delete res.req.body['_'];
            model.save(res.req.body, function(err, info) {
                if (err) {res.next(err); return; }
                
                res.req.flash('info', 'Adding ' + res.req.controller.name + ' success');
                res.redirect('/' + res.req.controller.name + '/listing');
                return;
            }); 
        } else {
            model.fields(function(err, fields) {
                if (err) {res.next(err); return; }
                
                res.local('fields', fields);
                res.next();
            });
        }
        
    },
    
    remove: function(id, confirmed) {
        var res = this;
        if (confirmed) {
            var model = Model.get(this.controller.name, this.app);
            model.remove(id, function(err, info) {
                if (err) {res.next(err); return; }
                
                res.req.flash('info', 'Deleting ' + res.controller.name + ' success');
                res.redirect('/' + res.controller.name + '/listing');
                return;
            });
        } else {
            res.next();
        }
    },
    
    edit: function(id) {
        var res = this;
        var model = Model.get(this.controller.name, this.app);
        
        if (this.req.isValid) {
            delete this.req.body['_'];
            model.save(this.req.body, id, function(err, info) {
                if (err) {res.next(err); return; }
                
                res.req.flash('info', 'Editing ' + res.controller.name + ' success');
                res.redirect('/' + res.controller.name + '/listing');
                return;
            });
        } else {
            model.fields(function(err, fields) {
                res.local('fields', fields);
                model.get({
                    id: id
                }, function(err, results) {
                    if (err) { res.next(err); return; }
                    
                    if (results.length === 0) { res.next(new Error('Data not found')); return; }
                    
                    res.req.form = results[0];
                    res.next();
                });
            });
        }
    }
});

exports.CrudController = CrudController;