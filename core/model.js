var Class = require('../core/class').Class;
var DB = require("../libraries/db").DB;

var Model = Class.extend({
    app: null,
    db: null,
    name: '__root',
    __fields: null,
    __sys_fields: ['id', 'active', 'created_by', 'created_time', 'updated_by', 'updated_time'],
    
    init: function(app) {
        this.app = app;
        this.db = DB.get(app);
    },
    
    fields: function(cb) {
        var self = this;
        if (this.__fields === null) {
            this.query('SELECT * FROM ' + this.db.__protect(this.name), function(err, results, fields) {
                for (var i in fields) {
                    var found = false;
                    for(var j in self.__sys_fields) {
                        if (self.__sys_fields[j] === i) {
                            found = true;
                            break;
                        }
                    }
                    fields[i].isSystem = found;
                    
                }
                self.__fields = fields;
                cb && cb(err, fields);
            });
        } else {
            cb && cb(null, this.__fields);
        }
    },
    
    query: function(sql, params, cb) {
        this.db.query(sql, params, cb);
    },
    
    get: function(filter, cb) {
        this.db.record().where(filter).get(this.name, null, null, cb);
    },

    listing: function(offset, limit, cb) {
        var ar = this.db.record();
        var params = [];
        
        var sql = ar.sqlGet(params, this.name, offset, limit);
        var rowCountSql = ar.sqlRowCount([], this.name);
        
        this.query(rowCountSql, [], function(err, results, fields) {
            if (err) { cb(err); return; }
            
            var count = results[0].count;
            this.query(sql, params, function(err, results, fields) {
                cb(err, results, fields, count);
            });
        });
    },
    
    beforeSave: function(data, id) {
        data['updated_time'] = new Date();
        data['updated_by'] = 1;
        if (!id) {
            data['created_time'] = data['updated_time'];
            data['created_by'] = data['updated_by'];
            
            (typeof(data['active']) === 'undefined') && (data['active'] = 1);
        }
    },
    
    save: function(data, id, cb) {
        if (typeof(id) === 'function') {
            cb = id;
            id = null;
        }
        
        this.beforeSave(data, id);
        if (id) {
            this.db.record().where('id', id).update(this.name, data, cb);
        } else {
            this.db.record().insert(this.name, data, cb);
        }
        
        
    },
     
    remove: function(id, cb) {
        this.db.record().where('id', id).remove(this.name, cb);
    }
});

Model.models = {};

Model.get =  function(name, app) {
    if (typeof(this.models[name]) === 'undefined') {
        var M = require('../models/' + name).Model;
        this.models[name] = new M(app);
    }
    return this.models[name];
};

exports.Model = Model;