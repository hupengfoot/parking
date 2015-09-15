'use strict'
var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var userBiz = require(path.join(global.rootPath,'interfaceBiz/userBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var decode = require(path.join(global.rootPath, 'util/decode'));
var sms = require(path.join(global.rootPath, 'util/sms'));
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

router.post('/updateliense', function(req, res){
    var param = url.parse(req.url, true).query;
    userBiz.updateLiense(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/querylienseplate', function(req, res){
    var param = url.parse(req.url, true).query;
    userBiz.queryLiensePlate(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/query', function(req, res){
    var param = url.parse(req.url, true).query;
    userBiz.myInfo(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/updateinfo', function(req, res){
    var param = url.parse(req.url, true).query;
    userBiz.updateInfo(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

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

router.post('/updatepsw', function(req, res){
    var param = url.parse(req.url, true).query;
    async.waterfall([
	function(callback){
	    sms.valid(param.szCode, param.iPhoneNum, function(check){
		if(check === true){
		    callback(null);
		}else{
		    callback(msg.code.ERR_VALID_SMS);
		}
	    });
	},
	function(callback){
	    //解码密码
	    param.szPasswd = decode.decodePasswd(param.szPasswd);
	    if(param.szPasswd === null){
		msg.wrapper(msg.code.ERR_DB_ERR, null, res);
		return;
	    }

	    userBiz.modifyPasswd(param, function(err, rows, fields){
		callback(err, rows);
	    });
	}
    ], function(err, results){
	msg.wrapper(err, results, res);
    });
});

router.post('/modifypsw', function(req, res){
    var param = url.parse(req.url, true).query;
    async.waterfall([
	function(callback){
	    //解码密码
	    param.szOldPasswd = decode.decodePasswd(param.szOldPasswd);
	    if(param.szOldPasswd === null){
		callback(msg.code.ERR_PASSWD_INCORRECT);
		return;
	    }

	    var tempParam = {};
	    tempParam.szPasswd = param.szOldPasswd;
	    tempParam.iPhoneNum = param.iPhoneNum;
	    userBiz.checkPasswd(tempParam, function(err, check){
		if(err){
		    callback(err);
		}else{
		    if(check === true){
			callback(null);
		    }else{
			callback(msg.code.ERR_PASSWD_INCORRECT);
		    }
		}
	    });
	},
	function(callback){
	    param.szPasswd = decode.decodePasswd(param.szPasswd);
	    userBiz.modifyPasswd(param, function(err, rows, fields){
		callback(err, rows);
	    });
	}
    ], function(err, results){
	msg.wrapper(err, results, res);
    });
});

module.exports = router;
