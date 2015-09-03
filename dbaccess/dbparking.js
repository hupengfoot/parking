var mysql = require('mysql'); 
var path = require('path');
var config = require(path.join(global.rootPath, "config/mysql"));

var sqlPool = mysql.createPool({
	host:config.szDbIP,
	port:config.szDbPort,
	user:config.szDbUser,
	password:config.szDbPwd,
	database:config.szDbDefaultDb,
	connectionLimit:'10',
	timezone:'Asia/Hong Kong'});

var excute = function(szSql, cb){
    var tStart = Date.now();
    sqlPool.query(szSql, function(err, rows, fields){
	var tUsed = Date.now() - tStart;
	console.log(szSql + ' ' + tUsed + 'ms');
	if(err){
	    console.error('excute %s error %s', szSql, JSON.stringify(err));
	}
	if(cb){
	    cb(err, rows, fields);
	}
    });
};

sqlPool.excute = excute;
module.exports = sqlPool;

