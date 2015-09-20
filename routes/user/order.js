'use strict'
var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var orderBiz = require(path.join(global.rootPath,'interfaceBiz/orderBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/querymine', function(req, res){
    var param = url.parse(req.url, true).query;
    orderBiz.queryMine(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/book', function(req, res){
    var param = url.parse(req.url, true).query;
    orderBiz.book(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/detail', function(req, res){
    var param = url.parse(req.url, true).query;
    orderBiz.getDetail(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/pay', function(req, res){
    var param = url.parse(req.url, true).query;
    orderBiz.pay(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
