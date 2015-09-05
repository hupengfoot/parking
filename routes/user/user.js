var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var userBiz = require(path.join(global.rootPath,'interfaceBiz/userBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var decode = require(path.join(global.rootPath, 'util/decode'));

router.post('/register', function(req, res){
    var param = url.parse(req.url, true).query;

    //解码密码
    param.szPasswd = decode.decodePasswd(param.szPasswd);
    if(param.szPasswd === null){
	msg.wrapper(msg.code.ERR_DB_ERR, null, res);
	return;
    }

    async.waterfall([
	function(callback){
	    userBiz.register(param, function(err, rows, fields){
		callback(err);
	    });
	},
	function(callback){
	    userBiz.recordPsw(param, function(err, rows, fields){
		callback(err, rows);
	    });
	}
    ],function(err, results){
	msg.wrapper(err, results, res);
    });
});

module.exports = router;
