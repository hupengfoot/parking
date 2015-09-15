var path = require('path');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var util = require('util');
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var redis_mgr = require(path.join(global.rootPath, 'redis/redis_mgr'));
var async = require('async');

var communityBiz = {};

communityBiz.publish = function(params, cb){
    var insertParams = [params.iChargesType, params.iX, params.iY, params.iProvince, params.iCity, params.szAreaName, params.szComminityName, params.szPicUrl];
    sqlPool.excute(20004, insertParams, cb);
};

communityBiz.get = function(params, cb){
    sqlPool.excute(6, [params.iCommunityID], cb);
};

communityBiz.search = function(params, cb){
    sqlPool.excute(7, [params.iProvince, params.iCity, params.szName], cb);
};

module.exports = communityBiz;
