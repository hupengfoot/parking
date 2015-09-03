'use strict';

var path = require('path');
var util = require('util');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

var userBiz = {};

userBiz.register = function(params, cb){
    sqlPool.excute(20001, [params.iPhoneNum], function(err, rows, fields){
	if(err){
	    if(err.errno === 1062){
	        cb(msg.code.ERR_HAS_REGISTER);    
	    }else{
		cb(msg.code.ERR_DB_ERR);
	    }
	}else{
	    cb(err, rows, fields);
	}
    });
};

userBiz.recordPsw = function(params, cb){
    sqlPool.excute(20002, [params.iPhoneNum, params.szPasswd], cb);
};

userBiz.myInfo = function(params, cb){
    var szSql = 'select * from tbUserInfo where iPhoneNum = ?';
    
};

module.exports = userBiz;
