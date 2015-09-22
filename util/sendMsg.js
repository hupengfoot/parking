'use strict'
var util = require('util');
var path = require('path');
var async = require('async');

var msgboxBiz = require(path.join(global.rootPath, 'interfaceBiz/msgboxBiz'));
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var misc = require(path.join(global.rootPath, 'util/misc'));

var bookMsg = '您的订单%d已被用户%d抢单, 该用户已向您支付%d元, 租用开始时间为%s, 结束时间为%s';

var sendMsg = {};
var _ = {};

var msgEnum = {
    BOOKMSG : 1
};

var op_func_define = {
    '1':{
	'opFunc':'bookMsgFunc'
    }
};

sendMsg.enum = msgEnum;

sendMsg.send = function(iType, params){
    eval(op_func_define[iType].opFunc+"(iType, params)");
};

var bookMsgFunc = function(iType, params){
    var szContent = util.format(bookMsg, params.iPendingID, params.iPhoneNum, params.iPrice, params.tStart, params.tEnd);
    _.publishMsg(iType, szContent, '', params.iPhoneNum);
};

_.publishMsg = function(iType, szContent, szTitle, iPhoneNum){
    async.waterfall([
	function(callback){
	    redis_mgr.incr2(redis_define.enum.INCREMENT, redis_define.msgID, function(err, reply){
		if(err){
		    callback(err);
		}else{
		    var iMessageID = misc.getUniqueID(reply, _.getiPhoneNumTail(iPhoneNum));
		    callback(null, iMessageID);
		}
	    });   
	},
	function(iMessageID, callback){
	    var obj1 = {};
	    obj1.iMessageID = iMessageID;
	    obj1.iPhoneNum = iPhoneNum;
	    obj1.iType = iType;
	    obj1.szContent = szContent;
	    obj1.szTitle = szTitle;
	    msgboxBiz.insertMessageInfo(obj1, function(err, rows, fields){
		callback(null,iMessageID);
	    });
	},
	function(iMessageID, callback){
	    var obj2 = {};
	    obj2.iMessageID = iMessageID;
	    obj2.iPhoneNum = iPhoneNum;
	    obj2.iType = iType;
	    msgboxBiz.insertMessageBox(obj2, function(err, rows, fields){
		callback(null);
	    });
	}
    ], function(err, results){
    });
};

_.getiPhoneNumTail = function(iPhoneNum){
    return iPhoneNum % Math.floor(iPhoneNum / 10000);
};

module.exports = sendMsg;
