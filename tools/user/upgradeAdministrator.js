'use strict';
global.rootPath = __dirname + '/../../';

var path = require('path');
var util = require('util');
var async = require('async');
var lineReader = require('line-reader');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

redis_mgr.init(0);

var FileName = 'upgradelist';

lineReader.eachLine(FileName, function(line, last, cb) {
    if(line.length <= 0){
	cb();
	return;
    }
    var iPhoneNum = line;
    var szSql = 'update tbUserInfo set iRoleType = 3 where iPhoneNum = ' + iPhoneNum;
    
    async.waterfall([
	function(callback){
	    sqlPool.query(szSql, function(err, rows, fields){
	        if(!err && rows.affectedRows > 0){
		   console.error(iPhoneNum + ' update success!');
	        }else{
		   console.error(iPhoneNum + ' update fail!')
	        }
		callback(null);
	    });
	},
	function(callback){
	    redis_mgr.del2(redis_define.enum.LOGIN, iPhoneNum, function(err, info){
		callback(null);
	    });
	}
    ], function(err, results){
	if(last){
	    cb(false);
	}else{
	    cb();
	}
    });
});

