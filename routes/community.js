'use strict'

var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var communityBiz = require(path.join(global.rootPath,'interfaceBiz/communityBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/update', function(req, res){
    var param = url.parse(req.url, true).query;
    communityBiz.update(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/suggest', function(req, res){
    var param = url.parse(req.url, true).query;
    communityBiz.suggest(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/publish', function(req, res){
    var param = url.parse(req.url, true).query;
    communityBiz.publish(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/search', function(req, res){
    var param = url.parse(req.url, true).query;
    console.error('search community name is ' + param.szName);
    communityBiz.search(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/get', function(req, res){
    var param = url.parse(req.url, true).query;
    communityBiz.get(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/list', function(req, res){
    var param = url.parse(req.url, true).query;
    communityBiz.list(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});


module.exports = router;
