var Class = require('../core/class').Class;

var ActiveRecord = Class.extend({
    _select: '*',
    _from: null,
    _join: [],
    _where: [],
    _offset: 0,
    _limit: 0,
    
    from: function(from) {
        this._from = from;
    },
    
    limit: function(offset, limit) {
        if (!limit) {
            limit = offset;
            offset = 0;
        }
        this._offset = offset;
        this._limit = limit;
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
            if (s === '') {
                s += where[2] + ' ';
            }
            s += where[0] + '=' + where[1] + ' ';
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
    
    sqlRowCount: function(name) {
        name && this.from(name);
        
        return 'SELECT COUNT(*) count FROM ' + this.__from() + this.__join() + this.__where();
    }
});

exports.ActiveRecord = ActiveRecord;