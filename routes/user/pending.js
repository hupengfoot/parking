'use strict'
var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var pendingBiz = require(path.join(global.rootPath,'interfaceBiz/pendingBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

router.post('/publish', function(req, res){
    var param = url.parse(req.url, true).query;
    pendingBiz.publish(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
