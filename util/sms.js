var path = require("path");
var redis_mgr = require(path.join(global.rootPath, "redis/redis_mgr"));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var async = require('async');

var smsRedisItem = {};
smsRedisItem.tTime = 0;
smsRedisItem.value = "";

var sms = {};
var _ = {};

//TODO
_.send = function(iPhoneNum){
    return 0;
};

sms.getsmsnum = function(){
    var res = "";
    for(var i=0; i!=6; ++i){
        res += "" + Math.floor(Math.random() * 10);
    }
    return res;
};

sms.send = function(iPhoneNum, cb){
    var num = sms.getsmsnum();
    redis_mgr.get2(redis_define.enum.PHONE, iPhoneNum, function(err, res){
        var bSend = false;
        var iErr = 0;
        if(err){
            console.err(err);
        }else{
            if(res === null){
                bSend = true;
            }else{
                var tTime = parseInt(Date.now()) - parseInt(res.tTime);
                if(tTime < 1000 * 60){
                    iErr = msg.code.ERR_VALID_SMS_TIME;
                }else{
                    bSend = true;
                }
            }
        }
        if(bSend){
            smsRedisItem.tTime = Date.now();
            smsRedisItem.value = num;
            redis_mgr.set2(redis_define.enum.PHONE, iPhoneNum, smsRedisItem);
	    var str = 'xxxxx'//TODO
            var iRet = _.send(iPhoneNum);
            cb(iErr, {szCode : smsRedisItem.value});
        }else{
            cb(iErr);
        }
    });
};

sms.valid = function(iNum,iPhoneNum,cb){
    redis_mgr.get2(redis_define.enum.PHONE, iPhoneNum, function(err, res){
        var bRes = false;
        if(!err && res && res.value == iNum){
            redis_mgr.del2(redis_define.enum.PHONE, iPhoneNum);
            bRes = true;
        }else{
            console.error("redis err %s value %s", err, res);
        }
        if(cb) cb(bRes);
    });
};

module.exports = sms;
