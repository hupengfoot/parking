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

var announceBiz = {};
var _ = {};

announceBiz.query = function(params, cb){
    var szWhere = '';
    if(params.tPublishTime !== null && params.tPublishTime !== undefined && params.tPublishTime.length > 0){
	szWhere = szWhere + " and unix_timestamp(tPublishTime) < unix_timestamp('" + params.tPublishTime + "')";
    }
    sqlPool.excute(22, [params.iAnnounceID, szWhere, params.iNum], cb);
};

announceBiz.publish = function(params, cb){
    sqlPool.excute(20013, [params.szDetailUrl, params.szImgUrl], cb);
};

module.exports = announceBiz;

