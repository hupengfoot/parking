var express = require('express');
var router = express.Router();
var path = require('path');
var url = require('url');

var queryCenter = require(path.join(global.rootPath, 'routes/common/common'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var misc = require(path.join(global.rootPath, 'util/misc'));
var global_config = require(path.join(global.rootPath, 'config/global_conf'));

var _ = {};

router.use(function(req, res, next){
    var param = url.parse(req.url, true).query;
    var queryObj = _.common_check_param(req, param);
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
	    if(parseInt(user.iRoleType) > 1){
		return true;
	    }else{
		return false;
	    }
	case 3:
	    if(parseInt(user.iRoleType) > 2){
		return true;
	    }else{
		return false;
	    }
	default:
	    return false;
    };
};

//检查传入参数是否合法，并对传入参数做脏字过滤
_.common_check_param = function(req, param){
    var queryObj = queryCenter.get(req);
    if(queryObj === null || (typeof queryObj == 'undefined')){
        return null;
    }
    var paramLength = queryObj.query.length;
    for(var j=0; j!=paramLength; ++j){
        var szParam = queryObj.query[j];
        if('string' != typeof param[szParam]){
            console.log("router "+req.path+ " param error "+szParam);
            return null;
        }else{
            if(global_config.iParamTypeCheck === 1){
                if(!_.checkType(queryObj, j, param)){
                    return null;
                }
            }
        }	
    }
    return queryObj;
}

//检查传入参数类型是否合法
_.checkType = function(queryObj, i, param){
    if(!queryObj || !queryObj.queryType || queryObj.queryType[i] === undefined){
        return false;
    }
    if(param[queryObj.query[i]] === null || param[queryObj.query[i]] === undefined || param[queryObj.query[i]] === ''){
        return true;
    }
    switch(queryObj.queryType[i]){
        case 'num':
            if(misc.checkParaParam(param[queryObj.query[i]])){
                return true;
            }else{
                return false;
            }
            break;
        case 'time':
            if(!isNaN(Date.parse(param[queryObj.query[i]]))){
                return true;
            }else{
                return false;
            }
            break;
        default:
            return true;
    }
}


module.exports = router;
