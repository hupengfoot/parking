/* jshint node:true*/
"use strict";
var path = require('path');
var async = require('async');
var util = require('util');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var sqlDefine = require(path.join(global.rootPath, 'sql/mysql_define'));
var misc = require(path.join(global.rootPath,'util/misc'));
var msg = require(path.join(global.rootPath, 'define/msg')).global_msg_define;
var eventMgr = require(path.join(global.rootPath, 'util/eventMgr'));
var eventDefine = require(path.join(global.rootPath, 'define/event'));
var user_msg_define = require(path.join(global.rootPath, "define/userMsg"));
var price = require(path.join(global.rootPath, 'util/price'));
var pendingBiz = require(path.join(global.rootPath, 'interfaceBiz/pendingBiz'));
var msgboxBiz = require(path.join(global.rootPath, 'interfaceBiz/msgboxBiz'));
var communityBiz = require(path.join(global.rootPath, 'interfaceBiz/communityBiz'));
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

var ossEventMsg ={};

var typeDefine = {};
var msgMakerFunc = {};

var bookMsg = '您的订单%d已被用户%d抢单, 该用户已向您支付%d元, 租用开始时间为%s, 结束时间为%s';

ossEventMsg.init = function() {
    var iLen = user_msg_define.event.length;
    for(var i=0; i!=iLen; ++i){
        typeDefine[user_msg_define.event[i].iType] = user_msg_define.event[i];
        var event = user_msg_define.event[i];
        msgMakerFunc[event.iType] = {};
        msgMakerFunc[event.iType].func = event.func;
    }

    eventMgr.register(eventDefine.enumType.MSG_SEND,function(params) {
        var iType = params.iType;
        var msg = params.msg;
        if(typeDefine[iType]){
            if(msgMakerFunc[iType].func && msgMakerFunc[iType].func.length > 0){
                var func = msgMakerFunc[iType].func + "(msg)";
                /*jshint ignore:start*/
                eval(func);
                /*jshint ignore:end*/
            }else{
                console.error('error msg iType or null func');
            }
        }
    });
};


// 通知大类 1801
//
var _ = {};

ossEventMsg.pendingHasPay = function(message){
    var szArg = message.szArg;
    async.waterfall([
	function(callback){
	    pendingBiz.detail(szArg, function(err, rows, fields){
		if(!err && rows.length > 0){
		    callback(null, rows[0]);
		}else{
		    callback(-1);
		}
	    });
	},
	function(pendingInfo, callback){
	    communityBiz.detail(pendingInfo, function(err, rows, fields){
		if(!err && rows.length > 0){
		    callback(null, pendingInfo, rows[0]);
		}else{
		    callback(-1);
		}
	    });
	},
	function(pendingInfo, communityInfo, callback){
	    var obj = {};
	    obj.iChargesType = communityInfo.iChargesType;
	    obj.tStart = szArg.tStart;
	    obj.tEnd = szArg.tEnd;
	    var iPrice = price.calPrice(obj);
	    var szContent = util.format(bookMsg, szArg.iPendingID, szArg.iPhoneNum, iPrice, szArg.tStart, szArg.tEnd);
	    _.publishMsg(message.iType, szContent, '', pendingInfo.iPhoneNum, function(err){
		callback(null);
	    });
	}
    ], function(err, results){
    });
};

_.publishMsg = function(iType, szContent, szTitle, iPhoneNum, cb){
    async.waterfall([
	function(callback){
	    redis_mgr.incr2(redis_define.enum.INCREMENT, redis_define.msgID, function(err, reply){
		if(err){
		    callback(err);
		}else{
		    var iMessageID = misc.getUniqueID(reply, misc.getiPhoneNumTail(iPhoneNum));
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
	cb(err);
    });
};

module.exports = ossEventMsg;

