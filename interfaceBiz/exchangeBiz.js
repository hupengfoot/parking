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
var eventMgr = require(path.join(global.rootPath, "util/eventMgr"));
var eventDefine = require(path.join(global.rootPath, 'define/event'));
var goodsBiz = require(path.join(global.rootPath, 'interfaceBiz/goodsBiz'));
var userBiz = require(path.join(global.rootPath, 'interfaceBiz/userBiz'));

var exchangeBiz = {};
var _ = {};
var userExchangeCnt = mysql_define.getTableCount('tbUserExchangeInfo');

exchangeBiz.exchange = function(params, cb){
    async.waterfall([
	function(callback){
	    goodsBiz.detail(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    if(rows[0].iNum >= params.iNum){
			callback(null, rows[0]);
		    }else{
			callback(msg.code.ERR_NOT_ENOUGH_GOODS);
		    }
		}else{
		    callback(msg.code.ERR_INVALID_GOODS);
		}
	    });
	},
	function(goodsInfo, callback){
	    userBiz.myInfo(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    if(rows[0].iScore > goodsInfo.iPrice * params.iNum){
			callback(null, goodsInfo);
		    }else{
			callback(msg.code.ERR_NOT_ENOUGH_SCORE);
		    }
		}else{
		    callback(msg.code.ERR_NOT_EXIST_USER);
		}
	    });
	},
	function(goodsInfo, callback){
	    sqlPool.beginTrans(function(conn, callback1){
		async.waterfall([
		    function(callback2){
			var obj = {};
			obj.iPhoneNum = params.iPhoneNum;
			obj.iScore = 0 - params.iNum * goodsInfo.iPrice;
			userBiz.updateScore(obj, function(err, rows, fields){
			    if(!err && rows.affectedRows === 1){
				callback2(null);
			    }else{
				callback2(msg.code.ERR_NOT_ENOUGH_SCORE);
			    }
			}, conn);
		    },
		    function(callback2){
			var obj1 = {};
			obj1.iPhoneNum = params.iPhoneNum;
			obj1.iGoodsID = params.iGoodsID;
			obj1.iNum = 0 - parseInt(params.iNum);
			goodsBiz.updateGoodsNum(obj1, function(err, rows, fields){
			    if(!err && rows.affectedRows > 0){
				callback2(null);
			    }else{
				callback2(msg.code.ERR_NOT_ENOUGH_GOODS);
			    }
			}, conn);
		    },
		    function(callback2){
			exchangeBiz.insertUserExchangeInfo(params, function(err, rows, fields){
			    callback2(err, rows);
			}, conn);
		    }
		], function(err){
		    if(!err){
			callback1(null);
			callback(null);
		    }else{
			callback1(1);
			callback(err);
		    }
		});
	    });
	}
    ], function(err){
	cb(err);
    });
};

exchangeBiz.insertUserExchangeInfo = function(params, cb, conn){
    async.waterfall([
	function(callback){
	    redis_mgr.incr2(redis_define.enum.INCREMENT, redis_define.exchangeID, function(err, info){
		if(err){
		    callback(err);
		}else{
		    callback(null, info);
		}
	    });
	},
	function(info, callback){
	    var tableNum = params.iPhoneNum % userExchangeCnt;
	    if(conn){
		conn.excute(20010, [tableNum, info, params.iPhoneNum, params.iGoodsID], function(err, rows, fields){
		    callback(err, rows);
		});
	    }else{
		sqlPool.excute(20010, [tableNum, info, params.iPhoneNum, params.iGoodsID], function(err, rows, fields){
		    callback(err, rows);
		});
	    }
	}
    ], function(err, results){
	cb(err, results);
    });
};

exchangeBiz.query = function(params, cb){
    var tableNum = params.iPhoneNum % userExchangeCnt;
    sqlPool.excute(17, [tableNum, params.iPhoneNum, params.iExchangeID, params.iNum], cb);
};

module.exports = exchangeBiz;

