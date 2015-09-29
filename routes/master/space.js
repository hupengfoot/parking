'use strict'

var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var spaceBiz = require(path.join(global.rootPath,'interfaceBiz/spaceBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/approve', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.approve(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/list', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.list(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/updatespace', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.masterUpdateSpace(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
