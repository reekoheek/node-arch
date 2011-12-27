var MySQLPool = require('mysql-pool').MySQLPool;
var Class = require('../core/class').Class
var ActiveRecord = require('../libraries/activerecord').ActiveRecord;

var DB = Class.extend({
    conn: null, 
    
    init: function(properties) {
        this.conn =  new MySQLPool(properties);
    },
    
    record: function() {
        return new ActiveRecord(this);
    },
    
    __protect: function(name) {
        return '`' + name + '`';
    },
    
    query: function(sql) {
        console.log(sql);
        this.conn.query.apply(this, arguments);
    }
});

DB.connections = {};
DB.get = function(name, app) {
    if (typeof(name) === 'object') {
        app = name;
        name = null;
    }
    var settings = app.settings.database;
    name = name || settings['default'];
    
    if (!DB.connections[name]) {
        var dbSetting = settings.config[name];
        
        
        var instance = new DB({
            poolSize: dbSetting.poolSize,
            user: dbSetting.user,
            password: dbSetting.password,
            database: dbSetting.database
        });
        DB.connections[name] = instance;
    }
    
    return DB.connections[name];
    
}
exports.DB = DB;