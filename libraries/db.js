var MySQLPool = require('mysql-pool').MySQLPool;
var Class = require('../core/class').Class
var ActiveRecord = require('../libraries/activerecord').ActiveRecord;

var DB = MySQLPool;

DB.prototype.record = function() {
    return new ActiveRecord(this);
}

//Class.inherits(DB, MySQLPool);

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
        
        
        var client = new DB({
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
        DB.connections[name] = client;
    }
    
    return DB.connections[name];
    
}
exports.DB = DB;