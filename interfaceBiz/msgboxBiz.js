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

var msgboxBiz = {};
var _ = {};

var messageInfoCnt = mysql_define.getTableCount('tbMessageInfo');
var messageBoxCnt = mysql_define.getTableCount('tbMessageBox');

msgboxBiz.insertMessageInfo = function(params, cb){
    var tableNum = params.iPhoneNum % messageInfoCnt;
    sqlPool.excute(20011, [tableNum, params.iMessageID, params.iType, params.szContent, params.szTitle], cb);
};

msgboxBiz.insertMessageBox = function(params, cb){
    var tableNum = params.iPhoneNum % messageBoxCnt;
    sqlPool.excute(20012, [tableNum, params.iMessageID, params.iPhoneNum, params.iType], cb);
};

module.exports = msgboxBiz;
