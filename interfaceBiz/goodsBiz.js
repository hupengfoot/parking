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

var goodsBiz = {};
var _ = {};

var goodsStatusEnum = {
    'ON_LINE': 0,
    'OFF_LINE': 1
};

goodsBiz.publish = function(params, cb){
    sqlPool.excute(20009, [params.szDesc, params.szPicUrl, params.iPrice, params.iNum], function(err, rows, fields){
	if(err){
	    cb(err);
	}else{
	    cb(null, {'iGoodsID': rows.insertId});
	}
    });
};

goodsBiz.set = function(params, cb){
    sqlPool.excute(10016, [params.iDelete, params.iGoodsID], function(err, rows, fields){
	cb(err);
    });
};

goodsBiz.query = function(params, cb){
    sqlPool.excute(15, [params.iGoodsID, params.iNum], cb);
};

goodsBiz.getBatchInfo = function(goodsArray, cb){
    sqlPool.excute(21, [goodsArray], cb);
};

goodsBiz.detail = function(params, cb){
    sqlPool.excute(16, [params.iGoodsID], function(err, rows, fields){
	if(!err && rows.length > 0){
	    cb(null, rows);
	}else{
	    cb(msg.code.ERR_INVALID_GOODS);
	}
    });
};

goodsBiz.updateGoodsNum = function(params, cb, conn){
    if(conn){
	conn.excute(10018, [params.iNum, params.iGoodsID, params.iNum], cb);
    }else{
	sqlPool.excute(10018, [params.iNum, params.iGoodsID, params.iNum], cb);
    }
};

module.exports = goodsBiz;

