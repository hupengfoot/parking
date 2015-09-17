'use strict';

var path = require('path');
var util = require('util');
var async = require('async');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var misc = require(path.join(global.rootPath, 'util/misc'));
var spaceBiz = require(path.join(global.rootPath, 'interfaceBiz/spaceBiz'));
var mysql_define = require(path.join(global.rootPath, 'sql/mysql_define'));
var price = require(path.join(global.rootPath, "config/price"));
var eventMgr = require(path.join(global.rootPath, "util/eventMgr"));
var eventDefine = require(path.join(global.rootPath, 'define/event'));

var pendingBiz = {};
var _ = {};
var pendingCnt = mysql_define.getTableCount('tbPendingInfo');
var userPendingCnt = mysql_define.getTableCount('tbUserPendingInfo');

var bookSuccessTimeHandle = redis_mgr.regTimer(redis_define.timer.BOOK_SUCCESS, function(obj){
    _.updatePendingStatus(obj, 3);
});

pendingBiz.init = function(){
    eventMgr.register(eventDefine.enumType.BOOK_SUCCESS, function(obj){
	_.bookSuccessOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.PAY_OVER_TIME, function(obj){
	_.payOverTimeOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.PAY_SUCCESS, function(obj){
	_.paySuccessOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.ORDER_FINISH,function(obj){
	_.orderFinishOperate(obj);
    });
};

pendingBiz.calPrice = function(params, cb){
    if(params.tStart === undefined || params.tStart === null || params.tEnd === undefined || params.tEnd === null){
	cb(msg.code.ERR_VALID_QUERY);
	return;
    }
    var iTotal = (Date.parse(new Date(params.tEnd)) - Date.parse(new Date(params.tStart))) / 1000 / 60 / 60;
    console.error(price[params.iChargesType]);
    console.error(iTotal);
    if(price[params.iChargesType] !== null && price[params.iChargesType] !== undefined){
	cb(null, {'price':iTotal * price[params.iChargesType].price});
    }else{
	cb(null, {'price':iTotal * price[1].price});
    }
};

pendingBiz.query = function(params, cb){
    var szWhere = '';
    szWhere = szWhere + misc.getSectionTimeLimit(params);
    var tableNum = parseInt(params.iCommunityID) % pendingCnt;
    var insertParams = [tableNum, params.iPendingID, params.iCommunityID, szWhere, params.iNum];
    sqlPool.excute(9, insertParams, cb);
};

pendingBiz.detail = function(params, cb){
    var szWhere = '';
    var tableNum = misc.getEndID(params.iPendingID) % pendingCnt;
    var insertParams = [tableNum, params.iPendingID];
    sqlPool.excute(10, insertParams, cb);
};

pendingBiz.queryMine = function(params, cb){
    var szWhere = '';
    if(parseInt(params.iStatus) !== -1){
	szWhere = szWhere + ' and iStatus = ' + params.iStatus;
    }
    szWhere = szWhere + misc.getTimeLimit(params);
    var tableNum = parseInt(params.iPhoneNum) % userPendingCnt;
    var insertParams = [tableNum, params.iPendingID, params.iPhoneNum, szWhere, params.iNum];
    sqlPool.excute(8, insertParams, cb);
};

pendingBiz.publish = function(params, cb){
    async.waterfall([
	function(callback){
	    spaceBiz.detail(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    if(rows[0].iHasApprove === 1){
			params.iCommunityID = rows[0].iCommunityID;
			if(rows[0].iStatus > 0){
			    callback(msg.code.ERR_HAS_PENDING);
			}else{
			    callback(null);
			}
		    }else{
			callback(msg.code.ERR_HAS_NOT_APPROVE);
		    }
		}else{
		    callback(msg.code.ERR_NOT_YOUR_SPACE);
		}
	    });
	},
	function(callback){
	    redis_mgr.incr2(redis_define.enum.INCREMENT, redis_define.pendingID, function(err, reply){
		if(err){
		    callback(err);
		}else{
		    var iPendingID = misc.getUniqueID(reply, params.iCommunityID);
		    params.iPendingID = iPendingID;
		    callback(null);
		}
	    });
	},
	function(callback){
	    pendingBiz.addPendingInfo(params, function(err, rows, fields){
		callback(err);
	    });
	},
	function(callback){
	    pendingBiz.addUserPendingInfo(params, function(err, rows, fields){
		callback(err);   
	    });
	}
    ], function(err){
	cb(err);
	//将该车位设置为已租用
	if(!err){
	    var obj = {};
	    obj.iSpaceID = params.iSpaceID;
	    obj.iStatus = 1;
	    spaceBiz.updateSpaceStatus(obj, function(){});
	}
    });
};

pendingBiz.addPendingInfo = function(params, cb){
    var tableNum = parseInt(params.iCommunityID) % pendingCnt; 
    var insertParams = [tableNum, params.iPendingID, params.iCommunityID, params.iPhoneNum, params.iSpaceID, params.tStart, params.tEnd, params.iMiniRental];
    sqlPool.excute(20005, insertParams, cb);
};

pendingBiz.addUserPendingInfo = function(params, cb){
    var tableNum = parseInt(params.iPhoneNum) % userPendingCnt;
    var insertParams = [tableNum, params.iPendingID, params.iCommunityID, params.iPhoneNum, params.iSpaceID, params.tStart, params.tEnd, params.iMiniRental];
    sqlPool.excute(20006, insertParams, cb);
};

pendingBiz.lockPendingStatus = function(params, cb){
    var tableNum = misc.getEndID(params.iPendingID) % pendingCnt;
    sqlPool.excute(10006, [tableNum, params.iPendingID], cb);
};

pendingBiz.updatePendingStatus = function(params, iStatus, cb){
    var tableNum = misc.getEndID(params.iPendingID) % pendingCnt;
    sqlPool.excute(10008, [tableNum, iStatus, params.iPendingID], cb);
};

pendingBiz.updateUserPendingStatus = function(params, iStatus, cb){
    var tableNum = parseInt(params.iPhoneNum) % userPendingCnt;
    sqlPool.excute(10007, [tableNum, iStatus, params.iPendingID], cb);
};

_.bookSuccessOperate = function(obj){
    _.updatePendingStatus(obj, 1);
};

_.updatePendingStatus = function(obj, iStatus){
    async.waterfall([
	function(callback){
	    pendingBiz.detail(obj, function(err, rows, fields){
		if(!err && rows.length > 0){
		    callback(null, rows[0]);
		}else{
		    callback(-1);
		}
	    });
	},
	function(pendingInfo, callback){
	    var param = {};
	    param.iPhoneNum = pendingInfo.iPhoneNum;
	    param.iPendingID = obj.iPendingID;
	    pendingBiz.updateUserPendingStatus(param, iStatus, function(err, rows, fields){
		callback(null);
	    });
	},
	function(callback){
	    pendingBiz.updatePendingStatus(obj, iStatus, function(err, rows, fields){
		callback(null);
	    });
	}
    ], function(err, results){
    });
};

_.payOverTimeOperate = function(obj){
    _.updatePendingStatus(obj, 0);
};

_.paySuccessOperate = function(obj){
    _.updatePendingStatus(obj, 2);
    //注册该单结束超时时间
    redis_mgr.addTimer(obj.TIMEOUT, obj, bookSuccessTimeHandle);
};

_.orderFinishOperate = function(obj){
    _.updatePendingStatus(obj, 3);
};

module.exports = pendingBiz;