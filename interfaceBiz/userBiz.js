'use strict';

var path = require('path');
var util = require('util');
var async = require('async');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var eventMgr = require(path.join(global.rootPath, "util/eventMgr"));
var eventDefine = require(path.join(global.rootPath, 'define/event'));

var pendingBiz = require(path.join(global.rootPath, 'interfaceBiz/pendingBiz'));

var userBiz = {};
var _ = {};

userBiz.init = function(){
    eventMgr.register(eventDefine.enumType.PUBLISH_PENDING, function(obj){
	_.publishPendingOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.PAY_SUCCESS, function(obj){
	_.paySuccessOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.ORDER_FINISH, function(obj){
	_.orderFinishOperate(obj);
    });
};

userBiz.updateLiense = function(params, cb){
    sqlPool.excute(10003, [params.szLiensePlate, params.iPhoneNum], cb);
};

userBiz.updateCredit = function(params, cb){
    sqlPool.excute(10025, [params.iCredit, params.iPhoneNum], cb);
};

userBiz.queryLiensePlate = function(params, cb){
    sqlPool.excute(3, [params.iPhoneNum], cb);
};

userBiz.updateLastLoginTime = function(params, cb){
    sqlPool.excute(10027, [params.iPhoneNum], cb);
};

userBiz.updateInfo = function(params, cb){
    var iHasComplete = 0;
    if(params.szMail !== null && params.szMail !== undefined && params.szRealName !== null && params.szRealName !== undefined && params.szBankCard !== null && params.szBankCard !== undefined && params.szBankAddress !== null && params.szBankAddress !== undefined){
	iHasComplete = 1;
    }
    sqlPool.excute(10002, [params.szUserName, params.szRealName, params.szMail, params.szLiensePlate, params.szAddress, params.szModels, params.szBankCard, params.szBankAddress,iHasComplete, params.szAlipay, params.szAlipayNickname, params.iPhoneNum], cb);
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

userBiz.updateScore2 = function(params, cb){
    sqlPool.excute(10024, [params.iScore, params.iScore, params.iPhoneNum], cb);
};

userBiz.updateRentTime = function(params, cb){
    sqlPool.excute(10021, [params.iRentTime, params.iPhoneNum], cb);
};

userBiz.updateOrderTime = function(params, cb){
    sqlPool.excute(10022, [params.iOrderTime, params.iPhoneNum], cb);
};

userBiz.updateMoney = function(params, cb){
    sqlPool.excute(10029, [params.iPrice, params.iPhoneNum], cb);
};

userBiz.control = function(params, cb){
    async.waterfall([
	function(callback){
	    sqlPool.excute(10026, [params.iStatus, params.iForbiddenPhoneNum], function(err, rows, fields){
		callback(err);
	    });
	},
	function(callback){
	    if(parseInt(params.iStatus) === 1){
		redis_mgr.del2(redis_define.enum.LOGIN, params.iForbiddenPhoneNum, function(err, info){
		    callback(null);
		});
	    }else{
		callback(null);
	    }
	}
    ], function(err, results){
	cb(err, results);
    });
};

_.publishPendingOperate = function(params){
    async.waterfall([
	function(callback){
	    redis_mgr.get2(redis_define.enum.HAS_PENDING_TODAY, params.iPhoneNum, function(err, info){
		if(err || info > 0){
		    callback(-1);
		}else{
		    callback(null);
		}
	    });
	},
	function(callback){
	    var obj = {};
	    obj.iPhoneNum = params.iPhoneNum;
	    obj.iScore = 10;
	    userBiz.updateScore(obj, function(){
		callback(null);
	    });
	}
    ], function(err, results){
	redis_mgr.set2(redis_define.enum.HAS_PENDING_TODAY, params.iPhoneNum, 1, function(){});
    });
};

_.paySuccessOperate = function(params){
    async.waterfall([
	function(callback){
	    pendingBiz.detail(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    callback(null, rows[0]);
		}else{
		    callback(-1);
		}
	    });
	},
	function(pendingInfo, callback){
	    var obj1 = {};
	    obj1.iPhoneNum = pendingInfo.iPhoneNum;
	    obj1.iScore = 10;
	    userBiz.updateScore(obj1, function(){
		callback(null, pendingInfo);
	    });
	},
	function(pendingInfo, callback){
	    var obj2 = {};
	    obj2.iPhoneNum = pendingInfo.iPhoneNum;
	    obj2.iRentTime = (Date.parse(params.tEnd) - Date.parse(params.tStart)) / 1000 / 60 / 60;
	    userBiz.updateRentTime(obj2, function(){
		callback(null, pendingInfo);
	    });
	},
	function(pendingInfo, callback){
	    var obj3 = {};
	    obj3.iPhoneNum = pendingInfo.iPhoneNum;
	    obj3.iPrice = params.iPrice;
	    userBiz.updateMoney(obj3, function(){
		callback(null);
	    });
	},
	function(callback){
	    var obj4 = {};
	    obj4.iPhoneNum = params.iPhoneNum;
	    obj4.iScore = 10;
	    userBiz.updateScore(obj4, function(){
		callback(null);
	    });
	},
	function(callback){
	    var obj5 = {};
	    obj5.iPhoneNum = params.iPhoneNum;
	    obj5.iOrderTime = (Date.parse(params.tEnd) - Date.parse(params.tStart)) / 1000 / 60 / 60;
	    userBiz.updateOrderTime(obj5, function(){
		callback(null);
	    });
	}
    ], function(err, results){
    });
};

_.orderFinishOperate = function(params){
    var endTime = Date.parse(params.tEnd);
    var nowTime = Date.parse(new Date());
    if(nowTime > endTime){
	var obj = {};
	obj.iPhoneNum = params.iPhoneNum;
	obj.iScore = -5;
	userBiz.updateScore2(obj, function(){
	});
    }else{
	var obj1 = {};
	obj1.iPhoneNum = params.iPhoneNum;
	obj1.iCredit = 10;
	userBiz.updateCredit(obj1, function(){
	});
    }
};

module.exports = userBiz;
