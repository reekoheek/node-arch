var Class = require('../core/class').Class;
//var mysql = require('mysql');
var MySQLPool = require("mysql-pool").MySQLPool;
var ActiveRecord = require('../libraries/activerecord').ActiveRecord;

var Model = Class.extend({
    app: null,
    connection: null,
    name: '__root',
    __fields: null,
    __sys_fields: ['id', 'active', 'created_by', 'created_time', 'updated_by', 'updated_time'],
    
    init: function(app) {
        this.app = app;
        this.connection = Model.connection(app);
    },
    
    __protect: function(name) {
        return '`' + name + '`';
    },
    
    fields: function(cb) {
        var self = this;
        if (this.__fields === null) {
            this.query('SELECT * FROM ' + this.__protect(this.name) + ' LIMIT 0', function(err, results, fields) {
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
        console.log(sql);
        this.connection.query(sql, params, cb);
    },
    
    activerecord: function() {
        return new ActiveRecord(this.connection);
    },

    listing: function(offset, limit, cb) {
        var ar = this.activerecord();
        var sql = ar.sqlGet(this.name, offset, limit);
        var rowCountSql = ar.sqlRowCount(this.name);
        
        this.query(rowCountSql, [], function(err, results, fields) {
            if (err) {
                cb(err);
                return;
            }
            var count = results[0].count;
            this.query(sql, [], function(err, results, fields) {
                if (err) {
                    cb(err);
                    return;
                }
                cb(err, results, fields, count);
            });
        });
    },
    
    beforeSave: function(data, id) {
        data['created_time'] = new Date();
        data['created_by'] = 1;
        if (!id) {
            data['updated_time'] = data['created_time'];
            data['updated_by'] = data['created_by'];
            
            (typeof(data['active']) === 'undefined') && (data['active'] = 1);
        }
    },
    
    save: function(data, id, cb) {
        if (typeof(id) === 'function') {
            cb = id;
            id = null;
        }
        
        this.beforeSave(data, id);
        
        var fields = [], values = [], params = [];
        for(var i in data) {
            fields.push(this.__protect(i));
            values.push('?');
            params.push(data[i]);
        }
        fields = fields.join(', ');
        values = values.join(', ');
        
        var sql = 'INSERT INTO ' + this.__protect(this.name) + '(' + fields + ') VALUES(' + values + ')';
        this.query(sql, params, function(err, info) {
            cb && cb(err, info);
        });
    }
});

Model.models = {};
Model.connections = {};

Model.get =  function(name, app) {
    if (typeof(this.models[name]) === 'undefined') {
        var M = require('../models/' + name).Model;
        this.models[name] = new M(app);
    }
    return this.models[name];
};

Model.connection = function(name, app) {
    if (typeof(name) === 'object') {
        app = name;
        name = null;
    }
    var settings = app.settings.database;
    name = name || settings['default'];
    
    if (!Model.connections[name]) {
        var dbSetting = settings.config[name];
        
        
        var client = new MySQLPool({
            poolSize: dbSetting.poolSize,
            user: dbSetting.user,
            password: dbSetting.password,
            database: dbSetting.database
        });
        
        //        var client = mysql.createClient({
        //            user: dbSetting.user,
        //            password: dbSetting.password,
        //            database: dbSetting.database
        //        });
        Model.connections[name] = client;
    }
    
    return Model.connections[name];
    
}

exports.Model = Model;