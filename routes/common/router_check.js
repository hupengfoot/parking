var express = require('express');
var router = express.Router();
var path = require('path');

var queryCenter = require(path.join(global.rootPath, 'routes/common/common'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

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
	    req.url += '&iPhoneNum=' + iPhoneNum;
	    next();
	}else{
	    msg.wrapper(msg.code.ERR_ACCESS_FAIL, null, res);	
	}
    }else{
	next();
    }
});

module.exports = router;
