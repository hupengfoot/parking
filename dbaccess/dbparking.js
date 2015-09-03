var mysql = require('mysql'); 
var path = require('path');
var config = require(path.join(global.rootPath, "config/mysql"));
var sqls = require('./sql').sqls;

var sqlPool = mysql.createPool({
	host:config.writeDB.szDbIP,
	port:config.writeDB.szDbPort,
	user:config.writeDB.szDbUser,
	password:config.writeDB.szDbPwd,
	database:config.writeDB.szDbDefaultDb,
	connectionLimit:'10',
	timezone:'Asia/Hong Kong'});

var readPool = mysql.createPool({
	host:config.readDB.szDbIP,
	port:config.readDB.szDbPort,
	user:config.readDB.szDbUser,
	password:config.readDB.szDbPwd,
	database:config.readDB.szDbDefaultDb,
	connectionLimit:'10',
	timezone:'Asia/Hong Kong'});

var writePool = mysql.createPool({
	host:config.writeDB.szDbIP,
	port:config.writeDB.szDbPort,
	user:config.writeDB.szDbUser,
	password:config.writeDB.szDbPwd,
	database:config.writeDB.szDbDefaultDb,
	connectionLimit:'10',
	timezone:'Asia/Hong Kong'});

var escapeId = function (val, forbidQualified) {
	if (Array.isArray(val)) {
        return val.map(function(v) {
            return escapeId(v, forbidQualified);
        }).join(', ');
	}
	if (forbidQualified) {
        return "'" + val.replace(/`/g, '``').replace(/^\s*'*|'*\s*$/,'') + "'";
	}
	return "'" + val.replace(/`/g, '``').replace(/\./g, '`.`').replace(/^\s*'*|'*\s*$/g,'') + "'";
};


//for repair func undef
var dateToString = function(val,timeZone) {
    console.error('sql params err Object try to string');
    if(val.toString && typeof val.toString === 'function'){
        return val.toString();
    }else{
        return 'error object';
    }
};
var bufferToString = dateToString;
var objectToValues = dateToString;

var my_escape = function(val, stringifyObjects, timeZone) {
	if (val === undefined || val === null) {
        return 'NULL';
	}
	switch (typeof val) {
        case 'boolean': return (val) ? 'true' : 'false';
        case 'number': return val+'';
	}
	if (val instanceof Date) {
        val = dateToString(val, timeZone || 'local');
	}
	if (Buffer.isBuffer(val)) {
        return bufferToString(val);
	}
	if (Array.isArray(val)) {
        return arrayToList(val, timeZone);
	}
	if (typeof val === 'object') {
        if (stringifyObjects) {
            val = val.toString();
        } else {
            return objectToValues(val, timeZone);
        }
	}
    val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
        switch(s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            default: return "\\"+s;
        }
    });
    return "'"+val+"'";
};

var escapeOrg = function(val, stringifyObjects, timeZone) {
	if (val === undefined || val === null) {
		return 'NULL';
	}

	switch (typeof val) {
		case 'boolean': return (val) ? 'true' : 'false';
		case 'number': return val+'';
	}

	if (val instanceof Date) {
		val = dateToString(val, timeZone || 'local');
	}

	if (Buffer.isBuffer(val)) {
		return bufferToString(val);
	}

	if (Array.isArray(val)) {
		return arrayToList(val, timeZone);
	}

	if (typeof val === 'object') {
		if (stringifyObjects) {
			val = val.toString();
		} else {
			return objectToValues(val, timeZone);
		}
	}

    val = val.replace(/[\0\n\r\b\t\\\"\x1a]/g, function(s) {
        switch(s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            default: return "\\"+s;
        }
    });
    return val;
};

var arrayToList = function(array, timeZone) {
	return array.map(function(v) {
        if (Array.isArray(v)){ return '(' + arrayToList(v, timeZone) + ')'; }
        return my_escape(v, true, timeZone);
	}).join(', ');
};

var format = function(sql, values, stringifyObjects, timeZone) {
	values = values === null ? [] : [].concat(values);
	return sql.replace(/\?\??|!/g, function(match) {
        if (!values.length) {
            return match;
        }
        if (match == "??") {
            return escapeId(values.shift());
        }
        if(match == "!"){
            return escapeOrg(values.shift(), stringifyObjects, timeZone);
        }
        return my_escape(values.shift(), stringifyObjects, timeZone);
	});
};

var filter = function(szOrder, szFilter, szValue){
    var szWhere = "";
    var astFilters = szFilter.split('|');
    szValue = szValue.replace("'","\\'");
    var astValues = szValue.split('|');
    var szStatus = " ( 1=2 ";
    var statuscnt = 0;
    for(var i=0; i!=astFilters.length; ++i){
        if(astFilters[i].length > 0){
            if(astFilters[i] == "iBugStatus" || astFilters[i] == "iStatus" || astFilters[i] == 'iFlag'){
                szStatus = szStatus + " or " + astFilters[i] + " = " + astValues[i];
                statuscnt++;
            }
            else{
                szWhere += " and " + astFilters[i] +"='"+astValues[i] + "'"; 
            }
        }
    }
    szStatus = szStatus + ")";
    if(statuscnt > 0){
        szWhere = szWhere + " and " +szStatus;
    }
    if(typeof szOrder != "undefined" && szOrder.length > 0){
        szWhere += " order by " + szOrder + " desc ";
    }
    return szWhere;
};

var orfilter = function(szOrder, szFilter, szValue){
    var szWhere = " (1=2";
    var astFilters = szFilter.split('|');
    szValue = szValue.replace("'","\\'");
    var astValues = szValue.split('|');
    for(var i=0; i!=astFilters.length; ++i){
        if(astFilters[i].length > 0){
            szWhere += " or " + astFilters[i] +" like '%"+astValues[i] + "%'"; 
        }
    }
    if(typeof szOrder != "undefined" && szOrder.length > 0){
        szWhere += ") order by " + szOrder;
    }
    return szWhere;
};

var _ = {};
_.getSql = function(sqlIndex, params, cb, format_custom){
    var szSql = sqls[sqlIndex];
    if(typeof szSql == 'undefined'){
        if(cb){
            cb("sqlIndex undefined:"+sqlIndex);
        }
        return;
    }
    szSql = format(szSql, params);
    if(typeof format_custom == 'function'){
        szSql = format_custom(szSql, params);
    }
    return szSql;
};

_.excute = function(szSql, inst, cb,sqlIndex){
    var tStart = Date.now();
    inst.query(szSql, function(err, rows, field){
        var tUsed = Date.now() - tStart;
        console.info(szSql + " " + tUsed + " ms");
        if(err){
            console.error('excute %s error %s', szSql, JSON.stringify(err));
        }
        if(cb){
            cb(err, rows, field);
        }
    });
};

//cb:function(err, conn)
var excute = function(sqlIndex, params, cb, format_custom){
    var szSql = _.getSql(sqlIndex, params, cb, format_custom);
    var iIndex = parseInt(sqlIndex);
    var curPool = readPool;
    if(iIndex < 10000){
        szSql = "select "+szSql;
        curPool = readPool;
    } else if(iIndex >= 10000 && iIndex<20000){
        szSql = "update "+szSql;
        curPool = writePool;
    } else if(iIndex >=20000 && iIndex < 30000){
        szSql = "insert "+szSql;
        curPool = writePool;
    } else if(iIndex >=30000 && iIndex < 40000){
        szSql = "delete "+szSql;
        curPool = writePool;
    }else if(iIndex >= 40000 && iIndex < 50000){
        szSql = "replace "+szSql;
        curPool = writePool;
    }
    _.excute(szSql, curPool, cb,sqlIndex);
};

var excute_conn = function(sqlIndex, params, cb, format_custom){
    var szSql = _.getSql(sqlIndex, params, cb, format_custom);
    var iIndex = parseInt(sqlIndex);
    if(iIndex < 10000){
        szSql = "select "+szSql;
    } else if(iIndex >= 10000 && iIndex<20000){
        szSql = "update "+szSql;
    } else if(iIndex >=20000 && iIndex < 30000){
        szSql = "insert "+szSql;
    } else if(iIndex >=30000 && iIndex < 40000){
        szSql = "delete "+szSql;
    }else if(iIndex >= 40000 && iIndex < 50000){
        szSql = "replace "+szSql;
    }
    _.excute(szSql, this.conn, cb,sqlIndex);
};


//cb:function(conn, callback) callback:function(err) err不为null表示需要回滚 
var beginTrans = function(cb){
    var connInst = {};
    connInst.format = format;
    connInst.filter = filter;
    connInst.orfilter = orfilter;
    connInst.excute = excute_conn;
    writePool.getConnection(function(err, conn){
        if(err){
            console.error("fail to beginTrans %s", err);
            cb(null);
        }else{
            connInst.conn = conn;
            conn.beginTransaction(function(err){
                if(err){
                    cb(null, null);
                    return;
                }
                cb(connInst, function(err){
                    if(err){
                        console.error('begin to rollback');
                        conn.rollback(function(){
                            conn.release();
                        });
                    }else{
                        conn.commit(function(err){
                            if(err){
                                conn.rollback(function(){
                                    conn.release();
                                });
                            }else{
                                conn.release();
                            }
                        });
                    }
                });
            });
        }
    });
};

sqlPool.beginTrans = beginTrans;
sqlPool.format = format;
sqlPool.filter = filter;
sqlPool.orfilter = orfilter;
sqlPool.excute = excute;
module.exports = sqlPool;
