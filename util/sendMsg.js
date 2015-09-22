var path = require("path");
var request = require('request');
var http = require('http');
var util = require('util');

var redis_mgr = require(path.join(global.rootPath, "redis/redis_mgr.js"));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var msgbox_define = require(path.join(global.rootPath, 'define/msgbox'));
var global_config = require(path.join(global.rootPath, 'config/global_conf')).global_config;
var misc = require(path.join(global.rootPath, 'util/misc'));

var szMsgUrl = 'http://127.0.0.1:%d/msg/publishmsgtoiphone?iPhoneNum=%d&iType=%d&szArg=%s';

var sendmsg = {};

//TODO check
function msg_check(params, iMsgType){
    return 1;
}

//获取msgbox进程号
sendmsg.init = function(){
   // var redis_mgr = require('../redis/redis_mgr.js');
   // redis_mgr.get2(redis_type_enum.REGISTER, global_config.szMsgboxRedisKey, function(err, res){
   //     console.log("msgbox process " + res);
   //     global_config.iMsgBoxPort = res;
   //     console.log("msgbox port is %d", global_config.iMsgBoxPort);
   // });
};

sendmsg.sendmsg = function(params, iMsgType, cb){
    if(!msg_check(params, iMsgType)){
        console.error("error msg type"); 
    }else{
        /*jshint ignore:start*/
        eval(msgbox_define.global_msgbox_func_define[iMsgType].opFunc+"(params, iMsgType, cb)");
        /*jshint ignore:end*/
    }
};

sendmsg.pushMsgToRedis = function(iPhoneNum, iMsgID, iType, sMsg, tTime){
    var msg = {};
    msg.iMsgID = iMsgID;
    msg.iType = iType;
    msg.sMsg = sMsg;
    msg.tTime = tTime;
    redis_mgr.rpush2(redis_type_enum.notifyMsgPrefix, iToQQ, JSON.stringify(msg));
    if(redis_define.notifyCnt[iType] !== undefined){
	    var cntKey = redis_define.notifyCnt[iType] + iToQQ;
        redis_mgr.incr2(redis_type_enum.MSGNUM, cntKey, function(err, redis_value){
        });
    }
};

var sendMsgToiPhone = function(params, iMsgType, cb){
    var j = request.jar();
    var cookie_key = 'key=' + params.key;
    var cookie = request.cookie(cookie_key);
    var url = util.format(szMsgUrl, global_config.iMsgBoxPort, params.iPhoneNum, params.iType, encodeURIComponent(params.szArg));
    j.setCookie(cookie, url);
    request({url: url, jar: j}, function (error, response, body) {
        try{
            var json = JSON.parse(decodeURIComponent(body));
            cb(error, json);
        }catch(err){
            cb(err);
        }
    });
};

module.exports = sendmsg;
