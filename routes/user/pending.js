'use strict'
var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var pendingBiz = require(path.join(global.rootPath,'interfaceBiz/pendingBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/publish', function(req, res){
    var param = url.parse(req.url, true).query;
    pendingBiz.publish(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/querymine', function(req, res){
    var param = url.parse(req.url, true).query;
    pendingBiz.queryMine(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/query', function(req, res){
    var param = url.parse(req.url, true).query;
    pendingBiz.query(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/detail', function(req, res){
    var param = url.parse(req.url, true).query;
    pendingBiz.getDetail(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/calprice', function(req, res){
    var param = url.parse(req.url, true).query;
    pendingBiz.calPrice(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/cancel', function(req, res){
    var param = url.parse(req.url, true).query;
    pendingBiz.cancel(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});


module.exports = router;
