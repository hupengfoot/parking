'use strict'

var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var spaceBiz = require(path.join(global.rootPath,'interfaceBiz/spaceBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/queryspace', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.querySpace(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/addspace', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.addSpace(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/deletespace', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.deleteSpace(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/updatespace', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.updateSpace(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
