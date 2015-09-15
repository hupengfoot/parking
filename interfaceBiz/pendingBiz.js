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

var pendingBiz = {};
var _ = {};
var pendingCnt = mysql_define.getTableCount('tbPendingInfo');
var userPendingCnt = mysql_define.getTableCount('tbUserPendingInfo');

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
    szWhere = szWhere + misc.getTimeLimit(params);
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
	    spaceBiz.queryASpace(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    params.iCommunityID = rows[0].iCommunityID;
		    callback(null);
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

module.exports = pendingBiz;
