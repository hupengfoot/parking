'use strict'
var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var userBiz = require(path.join(global.rootPath,'interfaceBiz/userBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

router.post('/control', function(req, res){
    var param = url.parse(req.url, true).query;
    userBiz.control(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
