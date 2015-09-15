'use strict';

var path = require('path');
var util = require('util');
var async = require('async');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var misc = require(path.join(global.rootPath, 'util/misc'));
var mysql_define = require(path.join(global.rootPath, 'sql/mysql_define'));
var pendingBiz = require(path.join(global.rootPath, 'interfaceBiz/pendingBiz'));
var communityBiz = require(path.join(global.rootPath, 'interfaceBiz/communityBiz'));
var price = require(path.join(global.rootPath, 'util/price'));

var orderBiz = {};
var orderCnt = mysql_define.getTableCount('tbOrderInfo');
var userOrderCnt = mysql_define.getTableCount('tbUserOrderInfo');

orderBiz.pay = function(params, cb){
    var tableNum1 = misc.getEndID(params.iOrderID) % orderCnt;
    var tableNum2 = parseInt(params.iPhoneNum) % userOrderCnt;
    sqlPool.excute(10009, [tableNum1, 1, params.iOrderID], cb);
    sqlPool.excute(10010, [tableNum2, 1, params.iOrderID], function(){});
};

orderBiz.queryMine = function(params, cb){
    var szWhere = '';
    szWhere = szWhere + misc.getTimeLimit(params);
    if(parseInt(params.iPay) !== -1){
	szWhere = szWhere + ' iPay = ' + params.iPay;
    }
    var tableNum = params.iPhoneNum % userOrderCnt;
    sqlPool.excute(13, [tableNum, params.iPhoneNum, params.iOrderID, szWhere, params.iNum], cb);
};

orderBiz.book = function(params, cb){
    async.waterfall([
	function(callback){
	    pendingBiz.lockPendingStatus(params, function(err, rows, fields){
		if(!err && rows.affectedRows > 0){
		    callback(null);
		}else{
		    callback(msg.code.ERR_BOOK_FAIL);
		}
	    });
	},
	function(callback){
	    pendingBiz.detail(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    callback(null, rows[0]);
		}else{
		    callback(msg.code.ERR_BOOK_FAIL);
		}
	    });
	},
	function(pendingInfo, callback){
	    communityBiz.detail(pendingInfo, function(err, rows, fields){
		if(!err && rows.length > 0){
		    callback(null, pendingInfo, rows[0]);
		}else{
		    callback(msg.code.ERR_BOOK_FAIL);
		}
	    });
	},
	function(pendingInfo, communityInfo, callback){
	    params.iChargesType = communityInfo.iChargesType;
	    params.iCommunityID = communityInfo.iCommunityID;
	    params.iPrice = price.calPrice(params);
	    redis_mgr.incr2(redis_define.enum.INCREMENT, redis_define.orderID, function(err, reply){
		if(err){
		    callback(msg.code.ERR_BOOK_FAIL);
		}else{
		    params.iOrderID = misc.getUniqueID(reply, params.iCommunityID);
		    orderBiz.addOrderInfo(params, function(err1, rows, fields){
			if(!err1){
			    callback(null, {'iOrderID':params.iOrderID, 'iPrice':params.iPrice})
			}else{
			    callback(err1);
			}
		    });
		    orderBiz.addUserOrderInfo(params, function(){});
		    pendingBiz.updateUserPendingStatus(params, function(){});
		}
	    });
	}
    ], function(err, results){
	cb(err, results);
    });
};

orderBiz.detail = function(params, cb){
    var tableNum = misc.getEndID(params.iOrderID) % orderCnt;
    sqlPool.excute(12, [tableNum, params.iOrderID], cb);
};

orderBiz.addOrderInfo = function(params, cb){
    var tableNum = parseInt(params.iCommunityID) % orderCnt;
    var insertParams = [tableNum, params.iOrderID, params.iCommunityID, params.iPendingID, params.iPhoneNum, params.tStart, params.tEnd, params.iPrice, params.szLiensePlate];
    sqlPool.excute(20007, insertParams, cb);
};

orderBiz.addUserOrderInfo = function(params, cb){
    var tableNum = parseInt(params.iPhoneNum) % userOrderCnt;
    var insertParams = [tableNum, params.iOrderID, params.iCommunityID, params.iPendingID, params.iPhoneNum, params.tStart, params.tEnd, params.iPrice, params.szLiensePlate];
    sqlPool.excute(20008, insertParams, cb);
};

module.exports = orderBiz;

