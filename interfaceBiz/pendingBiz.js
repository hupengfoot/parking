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

var pendingBiz = {};
var pendingCnt = mysql_define.getTableCount('tbPendingInfo');
var userPendingCnt = mysql_define.getTableCount('tbUserPendingInfo');

pendingBiz.publish = function(params, cb){
    var insertParam = [];
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
		    var iPendingID = misc.getUniqueID(params.iCommunityID, reply);
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

module.exports = pendingBiz;
