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

msgboxBiz.queryMsg = function(params, cb){
    var tableNum1 = params.iPhoneNum % messageBoxCnt;
    var tableNum2 = params.iPhoneNum % messageInfoCnt;
    var szWhere = '';
    if(parseInt(params.iType) !== -1){
	szWhere = szWhere + ' and b.iType = ' + params.iType;
    }
    if(params.tPublishTime !== null && params.tPublishTime !== undefined){
	szWhere = szWhere + " and unix_timestamp(b.dtPublishTime) < unix_timestamp('" + params.tPublishTime + "')";
    }
    sqlPool.excute(20, [tableNum1, tableNum2, params.iPhoneNum, params.iMessageID, szWhere, params.iNum], cb);
};

module.exports = msgboxBiz;
