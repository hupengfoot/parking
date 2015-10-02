'use strict';
global.rootPath = __dirname + '/../../';

var path = require('path');
var util = require('util');
var async = require('async');
var lineReader = require('line-reader');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));

var FileName = 'upgradelist';

lineReader.eachLine(FileName, function(line, last, cb) {
    if(line.length <= 0){
	cb();
	return;
    }
    var iPhoneNum = line;
    var szSql = 'update tbUserInfo set iRoleType = 3 where iPhoneNum = ' + iPhoneNum;
    
    sqlPool.query(szSql, function(err, rows, fields){
        if(!err && rows.affectedRows > 0){
	   console.error(iPhoneNum + ' update success!');
        }else{
	   console.error(iPhoneNum + ' update fail!')
        }
	if(last){
	    cb(false);
	}else{
	    cb();
	}
    });
});

