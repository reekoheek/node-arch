var Class = require('../core/class').Class;

var ActiveRecord = Class.extend({
    connection: null,
    _select: '*',
    _from: null,
    _join: [],
    _where: [],
    _offset: 0,
    _limit: 0,
    
    init: function(connection) {
        this.connection = connection;
        this.clearCache();
    },
    
    clearCache: function() {
        this._select= '*';
        this._from= null;
        this._join= [];
        this._where= [];
        this._offset= 0;
        this._limit= 0;
    },
    
    from: function(from) {
        this._from = from;
        return this;
    },
    
    where: function(filter) {
        if (typeof filter == 'object') {
            for (var i in filter) {
                this._where.push([i, filter[i], 'AND']);
            }
        } else {
            this._where.push(['id', filter, 'AND']);
        }
        return this;
    },
    
    limit: function(offset, limit) {
        if (!limit) {
            limit = offset;
            offset = 0;
        }
        this._offset = offset;
        this._limit = limit;
        
        return this;
    },
    
    escapeIdentifier: function(name) {
        return '`' + name + '`';
    },
    
    __select: function() {
        this._select || (this._select = '*');
        return this._select + ' ';
    },
    
    __from: function() {
        this._from || (this._from = '_');
        return this.escapeIdentifier(this._from) + ' ';
    },
    
    __join: function() {
        var s = '';
        for(var i in this._join) {
            var join = this._join[i];
            s += join[2] + ' JOIN ' + join[0] + ' ON ' + join[1] + ' ';
        }
        return s;
    },
    
    __where: function() {
        var s = '';
        for(var i in this._where) {
            var where = this._where[i];
            if (s !== '') {
                s += where[2] + ' ';
            } else {
                s += 'WHERE ';
            }
            s += where[0] + ' = ? ';
        }
        return s;
    },
    
    __limit: function() {
        return (this._limit > 0) ? 'LIMIT ' + this._offset + ', ' + this._limit : '';
    },
    
    sqlGet: function(name, offset, limit) {
        name && this.from(name);
        limit && this.limit(offset, limit);
        
        return 'SELECT ' + this.__select() + 'FROM ' + this.__from() + this.__join() + this.__where() + this.__limit();
    },
    
    get: function(name, offset, limit, cb) {
        var sql = this.sqlGet(name, offset, limit);
        var params = [];
        for(var i in this._where) {
            params.push(this._where[i][1]);
        }
        this.query(sql, params, cb);
    },
    
    query: function(sql, params, cb) {
        console.log(sql);
        this.connection.query(sql, params, cb);
        
        this.clearCache();
    },
    
    sqlRowCount: function(name) {
        name && this.from(name);
        
        return 'SELECT COUNT(*) count FROM ' + this.__from() + this.__join() + this.__where();
    }
});

exports.ActiveRecord = ActiveRecord;