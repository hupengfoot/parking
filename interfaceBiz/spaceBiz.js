'use strict'

var path = require('path');
var util = require('util');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

var spaceBiz = {};

spaceBiz.addSpace = function(params, cb){
    sqlPool.excute(20003, [params.iPhoneNum, params.iCommunityID, params.szParkingNum, params.iParkingType, params.iParkingNature], cb);
};

spaceBiz.querySpace = function(params, cb){
    sqlPool.excute(4, [params.iPhoneNum], cb);
};

spaceBiz.queryASpace = function(params, cb){
    sqlPool.excute(5, [params.iPhoneNum, params.iSpaceID], cb);
};

spaceBiz.deleteSpace = function(params, cb){
    sqlPool.excute(10004, [params.iPhoneNum, params.iSpaceID], cb);
};

spaceBiz.updateSpace = function(params, cb){
    sqlPool.excute(10005, [params.szParkingNum, params.iParkingType, params.iParkingNature, params.iPhoneNum, params.iSpaceID], cb);
};

module.exports = spaceBiz;
