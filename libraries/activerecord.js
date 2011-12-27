var Class = require('../core/class').Class;

var ActiveRecord = Class.extend({
    db: null,
    _select: '*',
    _from: null,
    _set: [],
    _join: [],
    _where: [],
    _offset: 0,
    _limit: 0,
    
    init: function(db) {
        this.db = db;
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
    
    set: function(data, value) {
        if (typeof data == 'object') {
            for (var i in data) {
                this._set.push([i, data[i]]);
            }
        } else {
            this._set.push([data, value]);
        }
        return this;
    },
    
    where: function(filter, value) {
        if (typeof filter == 'object') {
            for (var i in filter) {
                this._where.push([i, filter[i], 'AND']);
            }
        } else {
            if (typeof value == 'undefined') {
                this._where.push(['id', filter, 'AND']);
            } else {
                this._where.push([filter, value, 'AND']);
            }
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
    
    __where: function(params) {
        var s = '';
        for(var i in this._where) {
            var where = this._where[i];
            if (s !== '') {
                s += where[2] + ' ';
            } else {
                s += 'WHERE ';
            }
            s += this.escapeIdentifier(where[0]) + ' = ? ';
            
            params && params.push(where[1]);
        }
        return s;
    },
    
    __set: function(params) {
        var s = '';
        for(var i in this._set) {
            var set = this._set[i];
            if (s !== '') {
                s += ', ';
            } else {
                s += 'SET ';
            }
            s += this.escapeIdentifier(set[0]) + ' = ?';
            
            params && params.push(set[1]);
        }
        return s + ' ';
    },
    
    __insert: function(params) {
        var s = '', f = '';
        for(var i in this._set) {
            var set = this._set[i];
            if (f === '') {
                f += '( ' + this.escapeIdentifier(set[0]);
            } else {
                f += ', ' + this.escapeIdentifier(set[0]);
            }
            
            if (s === '') {
                s += 'VALUES(?';
            } else {
                s += ', ?';
            }
            
            params && params.push(set[1]);
        }
        s += ') ';
        f += ') ';
        return f + s;
    },
    
    __limit: function() {
        return (this._limit > 0) ? 'LIMIT ' + this._offset + ', ' + this._limit : '';
    },
    
    sqlGet: function(params, name, offset, limit) {
        name && this.from(name);
        limit && this.limit(offset, limit);
        
        return 'SELECT ' + this.__select() + 'FROM ' + this.__from() + this.__join() + this.__where(params) + this.__limit();
    },
    
    get: function(name, offset, limit, cb) {
        var params = [];
        var sql = this.sqlGet(params, name, offset, limit);
        this.query(sql, params, cb);
    },
    
    query: function(sql, params, cb) {
        this.db.query(sql, params, cb);
        this.clearCache();
    },
    
    update: function(name, data, cb) {
        var params = [];
        var sql = this.sqlUpdate(params, name, data);
        this.query(sql, params, cb);
    },
    
    sqlUpdate: function(params, name, data) {
        name && this.from(name);
        data && this.set(data);
        
        return 'UPDATE ' + this.__from() + this.__set(params) + this.__where(params);
    },
    
    insert: function(name, data, cb) {
        var params = [];
        var sql = this.sqlInsert(params, name, data);
        this.query(sql, params, cb);
    },
    
    remove: function(name, cb) {
        var params = [];
        var sql = this.sqlRemove(params, name);
        this.query(sql, params, cb);
    },
    
    sqlRemove: function(params, name) {
        name && this.from(name);
        
        return 'DELETE FROM ' + this.__from() + this.__where(params);
    },
    
    sqlInsert: function(params, name, data) {
        name && this.from(name);
        data && this.set(data);
        
        return 'INSERT INTO ' + this.__from() + this.__insert(params);
    },
    
    sqlRowCount: function(params, name) {
        name && this.from(name);
        return 'SELECT COUNT(*) count FROM ' + this.__from() + this.__join() + this.__where(params);
    }
});

exports.ActiveRecord = ActiveRecord;