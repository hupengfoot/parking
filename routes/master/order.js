'use strict'
var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var orderBiz = require(path.join(global.rootPath,'interfaceBiz/orderBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/check', function(req, res){
    var param = url.parse(req.url, true).query;
    orderBiz.check(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
