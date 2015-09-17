'use strict';
var path = require('path');
var async = require('async');
var util = require('util');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var redis_mgr = require(path.join(global.rootPath, 'redis/redis_mgr'));
var baiduMap = require(path.join(global.rootPath, 'util/baiduMap'));

var communityBiz = {};

communityBiz.publish = function(params, cb){
    var insertParams = [params.iChargesType, params.iX, params.iY, params.iProvince, params.iCity, params.iAreaName, params.szComminityName, params.szPicUrl];
    sqlPool.excute(20004, insertParams, function(err, rows, fields){
	if(err){
	    cb(err);
	}else{
	    cb(err, rows, fields);
	    //百度云上创建POI
	    //TODO
	    console.error('TODO TODO TODO TODO TODO TODO');
	    var obj = {};
	    obj.latitude = parseInt(params.iX) / 1000000;
	    obj.longitude = params.iY / 1000000;
	    obj.coord_type = 1;
	    obj.iCommunityID = rows.insertId;
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

communityBiz.search = function(params, cb){
    sqlPool.excute(7, [params.iProvince, params.iCity, params.szName], cb);
};

communityBiz.detail = function(params, cb){
    sqlPool.excute(11, [params.iCommunityID], cb);
};

module.exports = communityBiz;
