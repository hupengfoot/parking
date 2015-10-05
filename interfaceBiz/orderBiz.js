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
var spaceBiz = require(path.join(global.rootPath, 'interfaceBiz/spaceBiz'));
var communityBiz = require(path.join(global.rootPath, 'interfaceBiz/communityBiz'));
var price = require(path.join(global.rootPath, 'util/price'));
var sms = require(path.join(global.rootPath, 'util/sms'));
var eventMgr = require(path.join(global.rootPath, "util/eventMgr"));
var eventDefine = require(path.join(global.rootPath, 'define/event'));
var msgCenter = require(path.join(global.rootPath, 'oss/send'));
var user_msg_define = require(path.join(global.rootPath, "define/userMsg"));
var global_config = require(path.join(global.rootPath, "config/global_conf")).global_config;

var orderBiz = {};
var _ = {};
var orderCnt = mysql_define.getTableCount('tbOrderInfo');
var userOrderCnt = mysql_define.getTableCount('tbUserOrderInfo');

var payOverTimeHandle = redis_mgr.regTimer(redis_define.timer.PAY_OVER_TIME, function(obj){
    eventMgr.emit(eventDefine.enumType.PAY_OVER_TIME, obj);
});

orderBiz.init = function(){
    eventMgr.register(eventDefine.enumType.PAY_OVER_TIME, function(obj){
	_.payOverTimeOperate(obj);
    });
    eventMgr.register(eventDefine.enumType.ORDER_FINISH, function(obj){
	_.orderFinishOperate(obj);
    });
};

orderBiz.check = function(params, cb){
    async.waterfall([
	function(callback){
	    orderBiz.detail(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    params.iPendingID = rows[0].iPendingID;
		    params.iPhoneNum = rows[0].iPhoneNum;
		    params.iSpaceID = rows[0].iSpaceID;
		    if(rows[0].iPay === 1){
			callback(null, rows[0]);
		    }else{
			callback(msg.code.ERR_NOT_PAY);
		    }
		}else{
		    callback(msg.code.ERR_INVALID_ORDER);
		}
	    });
	},
	function(orderInfo, callback){
	    redis_mgr.get2(redis_define.enum.ORDER, params.iOrderID, function(err, info){
		if(!err){
		    if(info == params.szCode){
			callback(null, orderInfo);
		    }else{
			callback(msg.code.ERR_INVALID_SZCODE);
		    }
		}else{
		    callback(msg.code.ERR_DB_ERR);
		}
	    });
	},
	function(orderInfo, callback){
	    orderBiz.updateOrderStatus(params, 1, function(err, rows, fields){
		callback(err, rows, orderInfo);
	    });
	}
    ], function(err, results, orderInfo){
	cb(err, results);
	if(!err){
	    if(parseInt(params.iPassStatus) === 1){
		var obj = {};
		obj.iPendingID = params.iPendingID;
		obj.iOrderID = params.iOrderID;
		obj.iPhoneNum = params.iPhoneNum;
		obj.iSpaceID = params.iSpaceID;
		obj.tEnd = orderInfo.tEnd;
		eventMgr.emit(eventDefine.enumType.ORDER_FINISH, obj);
	    }
	}
    });
};

orderBiz.pay = function(params, cb){
    async.waterfall([
	function(callback){
	    orderBiz.detail(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    if(rows[0].iPay === 0){
			callback(null, rows[0]);
		    }else{
			callback(msg.code.ERR_PAY_OVER_TIME);
		    }
		}else{
		    callback(msg.code.ERR_PAY_FAIL);
		}
	    });
	},
	function(orderInfo, callback){
	    orderBiz.checkOrderPay(params, 1, function(err, rows, fields){
		if(!err && rows.affectedRows > 0){
		    //支付成功获取验证码
		    var num = sms.getsmsnum();
		    redis_mgr.set2(redis_define.enum.ORDER, params.iOrderID, num, function(){});
		    
		    var obj = {};
		    obj.iPendingID = orderInfo.iPendingID;
		    obj.iSpaceID = orderInfo.iSpaceID;
		    obj.iPhoneNum = params.iPhoneNum;
		    obj.tOrderStart = orderInfo.tStart;
		    obj.tOrderEnd = orderInfo.tEnd;
		    obj.TIMEOUT = (Date.parse(orderInfo.tEnd) - Date.parse(new Date())) /1000;
		    obj.iPrice = orderInfo.iPrice;
		    eventMgr.emit(eventDefine.enumType.PAY_SUCCESS, obj);
		    orderBiz.updateUserOrderPay(params, 1, function(){});
		    //向挂单用户发送订单成功消息
		    obj.tStart = orderInfo.tStart;
		    obj.tEnd = orderInfo.tEnd;
		    msgCenter.send(user_msg_define.enum.ORDER_PAY, obj);
		    callback(null, {'szCode':num});
		}else{
		    callback(msg.code.ERR_PAY_FAIL);
		}
	    });
	}
    ], function(err, results){
	cb(err, results);
    });
};

orderBiz.updateOrderPay = function(params, iStatus, cb){
    var tableNum = misc.getEndID(params.iOrderID) % orderCnt;
    sqlPool.excute(10009, [tableNum, iStatus, params.iOrderID], cb);
};

orderBiz.checkOrderPay = function(params, iStatus, cb){
    var tableNum = misc.getEndID(params.iOrderID) % orderCnt;
    sqlPool.excute(10013, [tableNum, iStatus, params.iOrderID], cb);
};

orderBiz.updateUserOrderPay = function(params, iStatus, cb){
    var tableNum = parseInt(params.iPhoneNum) % userOrderCnt;
    sqlPool.excute(10010, [tableNum, iStatus, params.iOrderID], cb);
};

orderBiz.queryMine = function(params, cb){
    async.waterfall([
	function(callback){
	    var szWhere = '';
	    szWhere = szWhere + misc.getTimeLimit(params);
	    if(parseInt(params.iPay) !== -1){
		szWhere = szWhere + ' and iPay = ' + params.iPay;
	    }
	    var tableNum = params.iPhoneNum % userOrderCnt;
	    sqlPool.excute(13, [tableNum, params.iPhoneNum, params.iOrderID, szWhere, params.iNum], function(err, rows, fields){
		callback(err, rows);
	    });
	},
	function(orderArray, callback){
	    if(orderArray.length > 0){
		var communities = orderArray.map(function(one){
		    return one.iCommunityID;
		});
		communityBiz.getBatchInfo(communities, function(err, rows, fields){
		    callback(null, orderArray, rows);	    
		});
	    }else{
		callback(null, orderArray, []);
	    }
	},
	function(orderArray, communityArray, callback){
	    if(orderArray.length > 0){
		var spaces = orderArray.map(function(one){
		    return one.iSpaceID;
		});
		spaceBiz.getBatchInfo(spaces, function(err, rows, fields){
		    callback(null, orderArray, communityArray, rows);	    
		});
	    }else{
		callback(null, orderArray, communityArray, []);
	    }
	}
    ], function(err, orderArray, communityArray, spaceArray){
	if(err){
	    cb(err);
	}else{
	    cb(null, {'order':orderArray, 'community':communityArray, 'space':spaceArray});
	}
    });
};

orderBiz.book = function(params, cb){
    async.waterfall([
	function(callback){
	    //获取订单详情
	    pendingBiz.detail(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    if(rows[0].iPhoneNum == params.iPhoneNum){
			callback(msg.code.ERR_NOT_ALLOW_GROB_OWN_PENDING);
		    }else{
			callback(null, rows[0]);
		    }
		}else{
		    callback(msg.code.ERR_BOOK_FAIL);
		}
	    });
	},
	function(pendingInfo, callback){
	    //判断抢单时间条件是否满足
	    _.checkOrderCondition(params, pendingInfo, function(err, pass){
		if(pass === true){
		    callback(null, pendingInfo);
		}else{
		    callback(msg.code.ERR_NOT_SATISFY_TIME);
		}
	    });
	},
	function(pendingInfo, callback){
	    //抢单
	    pendingBiz.lockPendingStatus(params, function(err, rows, fields){
		if(!err && rows.affectedRows > 0){
		    callback(null, pendingInfo);
		    pendingBiz.updateUserPendingStatus(pendingInfo, 1, function(){});
		}else{
		    callback(msg.code.ERR_BOOK_FAIL);
		}
	    });
	},
	function(pendingInfo, callback){
	    //获取小区详情
	    communityBiz.detail(pendingInfo, function(err, rows, fields){
		if(!err && rows.length > 0){
		    callback(null, pendingInfo, rows[0]);
		}else{
		    callback(msg.code.ERR_BOOK_FAIL);
		}
	    });
	},
	function(pendingInfo, communityInfo, callback){
	    //插入tbOrderInfo表
	    params.iChargesType = communityInfo.iChargesType;
	    params.iCommunityID = communityInfo.iCommunityID;
	    params.iSpaceID = pendingInfo.iSpaceID;
	    params.iPer = communityInfo.iPer;
	    params.iPerPrice = communityInfo.iPerPrice;
	    params.iMaxPrice = communityInfo.iMaxPrice;
	    params.iPrice = price.calPrice(params);
	    redis_mgr.incr2(redis_define.enum.INCREMENT, redis_define.orderID, function(err, reply){
		if(err){
		    callback(msg.code.ERR_BOOK_FAIL);
		}else{
		    params.iOrderID = misc.getUniqueID(reply, params.iCommunityID);
		    orderBiz.addOrderInfo(params, function(err1, rows, fields){
			if(!err1){
			    callback(null, {'iOrderID':params.iOrderID, 'iPrice':params.iPrice});
			    
			    //插入tbUserOrderInfo表
			    orderBiz.addUserOrderInfo(params, function(){});
	    
			    //发送车位预定成功事件
			    var obj = {};
			    obj.iPendingID = params.iPendingID;
			    obj.iSpaceID = params.iSpaceID;
			    obj.iOrderID = params.iOrderID;
			    obj.iPhoneNum = params.iPhoneNum;
			    eventMgr.emit(eventDefine.enumType.BOOK_SUCCESS, obj);

			    //注册支付超时事件 支付超时事件设置为15分钟
			    redis_mgr.addTimer(global_config.payOverTime, obj, payOverTimeHandle);
			}else{
			    callback(err1);
			}
		    });
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

orderBiz.getDetail = function(params, cb){
    async.waterfall([
	function(callback){
	    var tableNum = misc.getEndID(params.iOrderID) % orderCnt;
	    sqlPool.excute(12, [tableNum, params.iOrderID], function(err, rows, fields){
		callback(err, rows);
	    });
	},
	function(orderArray, callback){
	    if(orderArray.length > 0){
		var communities = orderArray.map(function(one){
		    return one.iCommunityID;
		});
		communityBiz.getBatchInfo(communities, function(err, rows, fields){
		    callback(null, orderArray, rows);	    
		});
	    }else{
		callback(null, orderArray, []);
	    }
	},
	function(orderArray, communityArray, callback){
	    if(orderArray.length > 0){
		var spaces = orderArray.map(function(one){
		    return one.iSpaceID;
		});
		spaceBiz.getBatchInfo(spaces, function(err, rows, fields){
		    callback(null, orderArray, communityArray, rows);	    
		});
	    }else{
		callback(null, orderArray, communityArray, []);
	    }
	}
    ], function(err, orderArray, communityArray, spaceArray){
	if(err){
	    cb(err);
	}else{
	    cb(null, {'order':orderArray, 'community':communityArray, 'space':spaceArray});
	}
    });
};

orderBiz.addOrderInfo = function(params, cb){
    var tableNum = parseInt(params.iCommunityID) % orderCnt;
    var insertParams = [tableNum, params.iOrderID, params.iCommunityID, params.iSpaceID, params.iPendingID, params.iPhoneNum, params.tStart, params.tEnd, params.iPrice, params.szLiensePlate];
    sqlPool.excute(20007, insertParams, cb);
};

orderBiz.addUserOrderInfo = function(params, cb){
    var tableNum = parseInt(params.iPhoneNum) % userOrderCnt;
    var insertParams = [tableNum, params.iOrderID, params.iCommunityID, params.iSpaceID, params.iPendingID, params.iPhoneNum, params.tStart, params.tEnd, params.iPrice, params.szLiensePlate];
    sqlPool.excute(20008, insertParams, cb);
};

orderBiz.updateOrderStatus = function(params, iStatus, cb){
    var tableNum = misc.getEndID(params.iOrderID) % orderCnt;
    sqlPool.excute(10011, [tableNum, iStatus, params.iOrderID, iStatus], cb);
};

orderBiz.updateUserOrderStatus = function(params, cb){
    var tableNum = params.iPhoneNum % userOrderCnt;
    sqlPool.excute(10014, [tableNum, params.iStatus, params.iOrderID, params.iStatus], cb);
};

_.payOverTimeOperate = function(obj){
    var param = {};
    param.iOrderID = obj.iOrderID;
    param.iPhoneNum = obj.iPhoneNum;
    async.waterfall([
	function(callback){
	    orderBiz.updateOrderPay(param, 2, function(err, rows, fields){
		callback(null);
	    });
	},
	function(callback){
	    orderBiz.updateUserOrderPay(param, 2, function(err, rows, fiedls){
		callback(null);
	    });
	}
    ], function(err, results){
    });
};

_.orderFinishOperate = function(obj){
    async.waterfall([
	function(callback){
	    pendingBiz.detail(obj, function(err, rows, fields){
		if(!err && rows.length > 0){
		    if(rows[0].iStatus < 3){
			callback(null, 2);
		    }else{
			callback(null, 3);
		    }
		}else{
		    callback(-1);
		}
	    });
	},
	function(iStatus, callback){
	    var param = {};
	    param.iStatus = iStatus;
	    param.iOrderID = obj.iOrderID;
	    param.iPhoneNum = obj.iPhoneNum;
	    orderBiz.updateOrderStatus(param, param.iStatus, function(err, rows, fields){
		callback(null);
	    });
	    orderBiz.updateUserOrderStatus(param, function(){});
	}
    ], function(err, results){
    });
};

_.checkOrderCondition = function(params, pendingInfo, cb){
    var orderStart = Date.parse(params.tStart);
    var orderEnd = Date.parse(params.tEnd);
    var pendingStart = Date.parse(pendingInfo.tStart);
    var pendingEnd = Date.parse(pendingInfo.tEnd);
    if(orderStart >= pendingStart && orderEnd <= pendingEnd){
	if((orderEnd - orderStart)/1000/3600 >= pendingInfo.iMiniRental){
	    cb(null, true);
	}else{
	    cb(null, false);
	}
    }else{
	cb(null, false);
    }
};

module.exports = orderBiz;

