'use strict';

var path = require('path');
var util = require('util');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

var userBiz = {};

userBiz.queryLiensePlate = function(params, cb){
    sqlPool.excute(3, [params.iPhoneNum], cb);
};

userBiz.updateInfo = function(params, cb){
    sqlPool.excute(10002, [params.szUserName, params.szRealName, params.szMail, params.szLiensePlate, params.szAddress, params.szModels, params.szBankCard, params.iPhoneNum], cb);
};

userBiz.modifyPasswd = function(params, cb){
    sqlPool.excute(10001, [params.szPasswd, params.iPhoneNum], cb);
};

userBiz.checkPasswd = function(params, cb){
    userBiz.getPsw(params, function(err, rows, fields){
	if(!err && rows.length > 0){
	    if(params.szPasswd == rows[0].szPasswd){
		cb(null, true);
	    }else{
		cb(null, false);
	    }
	}else{
	    cb(msg.code.ERR_NOT_EXIST_USER);
	}
    });
};

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
    sqlPool.excute(1, [params.iPhoneNum], cb);
};

userBiz.getPsw = function(params, cb){
    sqlPool.excute(2, [params.iPhoneNum], cb);
};

module.exports = userBiz;
