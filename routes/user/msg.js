'use strict'
var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var msgboxBiz = require(path.join(global.rootPath,'interfaceBiz/msgboxBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/querymsg', function(req, res){
    var param = url.parse(req.url, true).query;
    msgboxBiz.queryMsg(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
