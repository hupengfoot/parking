var express = require('express');
var router = express.Router();
var path = require('path');
var url = require('url');
var redis_mgr = require(path.join(global.rootPath, "redis/redis_mgr.js"));
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var queryCenter = require(path.join(global.rootPath, "routes/common/common"));

function overload_check_get_query_key_name(req){
    var szQueryName = req._parsedUrl.pathname.replace(/\//g, '_');
    var curSecond = parseInt((new Date().getTime()) / 1000); 
    return szQueryName + (curSecond % 100);
}
var iCount = {};
var preCountArray = {};
router.use(function(req, res, next){
    var szKey = overload_check_get_query_key_name(req);
    if(typeof iCount[szKey] == 'undefined'){
        iCount[szKey] = 0;
        preCountArray[szKey] = 0;
    }
    var queryObj = queryCenter.get(req);
    if(queryObj === null){
        res.jsonp(msg.getMsg(msg.code.ERR_VALID_QUERY));
    }else{
        iCount[szKey]++;
        if(iCount[szKey] > 10){
            redis_mgr.incrby(redis_type_enum.ACCESS_QUERY, szKey, iCount[szKey], function(err, redis_value){
                preCountArray[szKey] = redis_value;
                if(err){
                    preCountArray[szKey] = queryObj.limit + 1;
                }
            });
            iCount[szKey] = 0;
        }
        if(preCountArray[szKey] > queryObj.limit){
            res.jsonp(msg.getMsg(msg.code.ERR_FRESH_QUERY));
        }else{
            next();
        }
    }
});

module.exports = router;
