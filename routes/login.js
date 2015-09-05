var express = require('express');
var router = express.Router();
var path = require('path');
var url = require('url');
var util = require('util');
var uuid = require('node-uuid');
var async = require('async');

var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var userBiz = require(path.join(global.rootPath, 'interfaceBiz/userBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var decode = require(path.join(global.rootPath, 'util/decode'));

var _ = {};

router.post('/logout', function(req, res){
    var param = url.parse(req.url, true).query;
    redis_mgr.del2(redis_define.enum.LOGIN, param.iPhoneNum, function(err, info){
	msg.wrapper(msg.code.ERR_SUCCESS, null, res);
    });
});

router.post('/', function(req, res){
    var param = url.parse(req.url, true).query;

    //解码密码
    param.szPasswd = decode.decodePasswd(param.szPasswd);
    if(param.szPasswd === null){
	msg.wrapper(msg.code.ERR_PASSWD_INCORRECT, null, res);
	return;
    }

    async.waterfall([
	function(callback){
	    _.checkPasswd(param, function(err, check){
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
	    _.login(param, function(err, info){
		callback(err, info);
	    });
	}
    ], function(err, results){
	msg.wrapper(err, results, res);
    });
});

_.checkPasswd = function(params, cb){
    userBiz.getPsw(params, function(err, rows, fields){
	if(!err && rows.length > 0){
	    if(params.szPasswd == rows[0].szPasswd){
		cb(null, true);
	    }else{
		cb(null, false);
	    }
	}else{
	    cb(msg.code.ERR_NOT_EXIST_USER);
	}
    });
};

_.login = function(params, cb){
    var result = {};
    async.waterfall([
	function(callback){
	    redis_mgr.get2(redis_define.enum.LOGIN, params.iPhoneNum, function(err, userinfo){
		if(!err && userinfo){
		    result.key = userinfo.key;
		    result.iRoleType = userinfo.iRoleType;
		    callback(-1); //从缓存中读取
		}else{
		    callback(null);
		}
	    });
	},
	function(callback){
	    userBiz.myInfo(params, function(err, rows, fields){
		if(!err && rows.length > 0){
		    result.key = params.iPhoneNum + '_' +uuid.v1();
		    result.iRoleType = rows[0].iRoleType;
		    callback(null);
		    //设置redis中的LOGIN信息
		    rows[0].key = result.key;
		    redis_mgr.set2(redis_define.enum.LOGIN, params.iPhoneNum, rows[0]);
		}else{
		    callback(msg.code.ERR_NOT_EXIST_USER);
		}
	    });
	}
    ], function(err){
	if(err === -1){
	    cb(null, result);
	}else{
	    cb(err, result);
	}
    });
};

module.exports = router;
