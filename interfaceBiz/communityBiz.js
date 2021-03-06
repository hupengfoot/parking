'use strict';
var path = require('path');
var async = require('async');
var util = require('util');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var redis_mgr = require(path.join(global.rootPath, 'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var baiduMap = require(path.join(global.rootPath, 'util/baiduMap'));
var price = require(path.join(global.rootPath, 'util/price'));

var communityBiz = {};

communityBiz.update = function(params, cb){
    var insertParams = [params.iChargesType, params.iPer, params.iPerPrice, params.iMaxPrice, params.szX, params.szY, params.iProvince, params.iCity, params.szCommunityName, params.szAddressName, params.szPicUrl, params.iCommunityID];
    sqlPool.excute(10028, insertParams, cb);
};

communityBiz.suggest = function(params, cb){
    async.waterfall([
	function(callback){
	    redis_mgr.lrange(redis_define.enum.USER_SEARCHED, params.iPhoneNum, 0, -1, function(err, info){
		callback(err, info);
	    });
	},
	function(communityArray, callback){
	    if(communityArray.length <= 0){
		callback(null, []);
	    }else{
		communityBiz.getBatchInfo(communityArray, function(err, rows, fields){
		    callback(err, rows);
		});
	    }
	}
    ], function(err, results){
	cb(err, results);
    });
};


communityBiz.publish = function(params, cb){
    var insertParams = [params.iChargesType, params.iPer, params.iPerPrice, params.iMaxPrice, params.szX, params.szY, params.iProvince, params.iCity, params.szCommunityName, params.szAddressName, params.szPicUrl];
    sqlPool.excute(20004, insertParams, function(err, rows, fields){
	if(err){
	    cb(err);
	}else{
	    cb(err, rows, fields);
	    //百度云上创建POI
	    var obj = {};
	    obj.latitude = params.szX;
	    obj.longitude = params.szY;
	    obj.coord_type = 3;
	    obj.iCommunityID = rows.insertId;
	    obj.title = '小区-' + params.szCommunityName;
	    obj.tags = '小区';
	    baiduMap.createPoi(obj);
	}
    });
};

communityBiz.get = function(params, cb){
    sqlPool.excute(6, [params.iCommunityID], function(err, rows, fields){
	if(!err && rows.length > 0){
	    cb(err, rows, fields);
	}else{
	    cb(msg.code.ERR_NOT_REGISTER_COMMUNITY);
	}
    });
};

communityBiz.list = function(params, cb){
    var szWhere = '';
    szWhere = szWhere + ' and iCommunityID > ' + params.iCommunityID;
    sqlPool.excute(23, [params.iProvince, params.iCity, szWhere, params.iNum], function(err, rows, fields){
	cb(err, rows);
    });
};

communityBiz.search = function(params, cb){
    sqlPool.excute(7, [params.iProvince, params.iCity, params.szName, params.szName], cb);
};

communityBiz.detail = function(params, cb){
    sqlPool.excute(11, [params.iCommunityID], cb);
};

communityBiz.getBatchInfo = function(array, cb){
    sqlPool.excute(18, [array.join(',')], function(err, rows, fields){
	if(!err && rows.length > 0){
	    for(var i in rows){
		rows[i].szCharges = price.getInfo(rows[i]);
	    }
	    cb(null, rows);
	}else{
	    cb(err, rows);
	}
    });
};

module.exports = communityBiz;
