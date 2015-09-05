var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var sms = require(path.join(global.rootPath,'util/sms'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/register', function(req, res){
    var param = url.parse(req.url, true).query;
    sms.send(param.iPhoneNum, function(err, info){
	msg.wrapper(err, info, res);
    });
});

module.exports = router;


