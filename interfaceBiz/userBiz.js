'use strict';

var path = require('path');
var util = require('util');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

var userBiz = {};
var _ = {};

userBiz.init = function(){
    eventMgr.register(eventDefine.enumType.PUBLISH_PENDING, function(obj){
	_.publishPendingOperate(obj);
    });
};

userBiz.updateLiense = function(params, cb){
    sqlPool.excute(10003, [params.szLiensePlate, params.iPhoneNum], cb);
};

userBiz.queryLiensePlate = function(params, cb){
    sqlPool.excute(3, [params.iPhoneNum], cb);
};

userBiz.updateInfo = function(params, cb){
    var iHasComplete = 0;
    if(params.szMail !== null && params.szMail !== undefined && params.szRealName !== null && params.szRealName !== undefined && params.szBankCard !== null && params.szBankCard !== undefined && params.szBankAddress !== null && params.szBankAddress !== undefined){
	iHasComplete = 1;
    }
    sqlPool.excute(10002, [params.szUserName, params.szRealName, params.szMail, params.szLiensePlate, params.szAddress, params.szModels, params.szBankCard, params.szBankAddress, iHasComplete, params.iPhoneNum], cb);
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

userBiz.updateScore = function(params, cb, conn){
    if(conn){
	conn.excute(10017, [params.iScore, params.iPhoneNum, params.iScore], cb);
    }else{
	sqlPool.excute(10017, [params.iScore, params.iPhoneNum, params.iScore], cb);
    }
};

_.publishPendingOperate = function(params){
};

module.exports = userBiz;
