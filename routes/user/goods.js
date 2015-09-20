'use strict'
var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var goodsBiz = require(path.join(global.rootPath,'interfaceBiz/goodsBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/query', function(req, res){
    var param = url.parse(req.url, true).query;
    goodsBiz.query(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/getdetail', function(req, res){
    var param = url.parse(req.url, true).query;
    goodsBiz.detail(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
