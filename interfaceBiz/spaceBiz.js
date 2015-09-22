'use strict'

var path = require('path');
var util = require('util');
var async = require('async');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var eventMgr = require(path.join(global.rootPath, "util/eventMgr"));
var eventDefine = require(path.join(global.rootPath, 'define/event'));
var communityBiz = require(path.join(global.rootPath, 'interfaceBiz/communityBiz'));

var spaceBiz = {};
var _ = {};

var spaceStatusEnum = {
    'NOT_PENDING':0,
    'HAS_PENDING':1
};

spaceBiz.init = function(){
    eventMgr.register(eventDefine.enumType.BOOK_SUCCESS, function(obj){
	_.bookSuccessOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.PAY_OVER_TIME, function(obj){
	_.payOverTimeOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.PENDING_OVER_TIME,function(obj){
	_.pendingOverTimeOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.ORDER_FINISH,function(obj){
	_.orderFinishOverTimeOperate(obj);
    });

};

spaceBiz.approve = function(params, cb){
    sqlPool.excute(10015, [params.iSpaceID], cb);
};

spaceBiz.addSpace = function(params, cb){
    async.waterfall([
	function(callback){
	    communityBiz.detail(params, function(err, rows, fields){
	        if(!err && rows.length > 0){
	    	callback(null);
	        }else{
	    	callback(msg.code.ERR_NOT_REGISTER_COMMUNITY);
	        }
	    });
	},
	function(callback){
	    sqlPool.excute(20003, [params.iPhoneNum, params.iCommunityID, params.szParkingNum, params.szParkingPic, params.iParkingType, params.iParkingNature], function(err, rows){
		callback(err, rows);
	    });
	}
    ], function(err, results){
	cb(err, results);
    });
};

spaceBiz.querySpace = function(params, cb){
    sqlPool.excute(4, [params.iPhoneNum], cb);
};

spaceBiz.getMySpace = function(params, cb){
    sqlPool.excute(5, [params.iPhoneNum, params.iSpaceID], cb);
};

spaceBiz.deleteSpace = function(params, cb){
    sqlPool.excute(10004, [params.iPhoneNum, params.iSpaceID], cb);
};

spaceBiz.detail = function(params, cb){
    sqlPool.excute(14, [params.iSpaceID], function(err, rows, fields){
	if(!err && rows.length > 0){
	    cb(null, rows);
	}else{
	    cb(msg.code.ERR_INVALID_SPACE);
	}
    });
};

spaceBiz.updateSpace = function(params, cb){
    sqlPool.excute(10005, [params.szParkingNum, params.szParkingPic, params.iParkingType, params.iParkingNature, params.iPhoneNum, params.iSpaceID], cb);
};

spaceBiz.updateSpaceStatus = function(params, cb){
    sqlPool.excute(10012, [params.iStatus, params.iSpaceID], cb);
};

spaceBiz.getBatchInfo = function(array, cb){
    sqlPool.excute(19, [array.join(',')], cb);
};

_.bookSuccessOperate = function(obj){
    var param = {};
    param.iStatus = 1;
    param.iSpaceID = obj.iSpaceID;
    spaceBiz.updateSpaceStatus(param, function(){});
};

_.payOverTimeOperate = function(obj){
    var param = {};
    param.iStatus = 0;
    param.iSpaceID = obj.iSpaceID;
    spaceBiz.updateSpaceStatus(param, function(){});
};

_.pendingOverTimeOperate = function(obj){
    var param = {};
    param.iStatus = 0;
    param.iSpaceID = obj.iSpaceID;
    spaceBiz.updateSpaceStatus(param, function(){});
};

_.orderFinishOverTimeOperate = function(obj){
    var param = {};
    param.iStatus = 0;
    param.iSpaceID = obj.iSpaceID;
    spaceBiz.updateSpaceStatus(param, function(){});
};

module.exports = spaceBiz;
