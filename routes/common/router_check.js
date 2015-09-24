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
    if(queryObj === null){
	msg.wrapper(msg.code.ERR_ACCESS, null, res);	
	return;
    }
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
		    if(!_.accessRightCheck(queryObj, user)){
			msg.wrapper(msg.code.ERR_NOT_ENOUGH_ACCESS_RIGHT, null, res);	
			return;
		    }
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

_.accessRightCheck = function(queryObj, user){
    var access = queryObj.access;
    switch(access){
	case 0:
	    return true;
	case 1:
	    return true;
	case 2:
	    if(parseInt(user.iRoleType) > 0){
		return true;
	    }else{
		return false;
	    }
	case 3:
	    if(parseInt(user.iRoleType) > 1){
		return true;
	    }else{
		return false;
	    }
	default:
	    return false;
    };
};

module.exports = router;
