var express = require('express');
var router = express.Router();
var path = require('path');

var queryCenter = require(path.join(global.rootPath, 'routes/common/common'));

router.use(function(req, res, next){
    var queryObj = queryCenter.get(req);
    if(queryObj.access > 0 && typeof req.cookies.key !== 'undefined' && req.cookies.key.length > 0){
	if(req.url.indexOf('?') === -1){
	    req.url += '?';
	}
	var iPhoneNum = 0;
	try{
	    iPhoneNum = req.cookies.key.split('_')[0];
	}catch(e){
	}
	req.url += '&iPhoneNum=' + iPhoneNum;
	next();
    }else{
	next();
    }
});

module.exports = router;
