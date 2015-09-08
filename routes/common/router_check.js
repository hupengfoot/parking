var express = require('express');
var router = express.Router();
var path = require('path');

var queryCenter = require(path.join(global.rootPath, 'routes/common/common'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

var _ = {};

router.use(function(req, res, next){
    var queryObj = queryCenter.get(req);
    if(queryObj.access > 0){
	if(req.cookies.parking_app_key !== 'undefined' && req.cookies.parking_app_key !== null){
	    if(req.url.indexOf('?') === -1){
		req.url += '?';
	    }
	    var iPhoneNum = 0;
	    try{
		iPhoneNum = req.cookies.parking_app_key.split('_')[0];
	    }catch(e){
	    }
	    redis_mgr.get2(redis_define.enum.LOGIN, iPhoneNum, function(err, user){
		if(err || !user){
		    msg.wrapper(msg.code.ERR_ACCESS_FAIL, null, res);	
		}else{
		    if(user.parking_app_key == req.cookies.parking_app_key){
			req.url += '&iPhoneNum=' + iPhoneNum;
			next();
		    }else{
			msg.wrapper(msg.code.ERR_ACCESS_FAIL, null, res);	
		    }
		}
	    });
	}else{
	    msg.wrapper(msg.code.ERR_ACCESS_FAIL, null, res);	
	}
    }else{
	next();
    }
});

module.exports = router;
