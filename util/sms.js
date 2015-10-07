var path = require("path");
var async = require('async');
var request = require('request');
var util = require('util');

var redis_mgr = require(path.join(global.rootPath, "redis/redis_mgr"));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var global_config = require(path.join(global.rootPath, 'config/global_conf')).global_config;

var smsRedisItem = {};
smsRedisItem.tTime = 0;
smsRedisItem.value = "";

var sms = {};
var _ = {};
var content = '您的验证码为%s，在3分钟内有效';
var smsurl = 'http://api.smsbao.com/sms?u=hupengfoot&p=EF7E23F4FCAB51A85F87D09647724878&m=13917658422&c=这个接口好扯淡';

_.send = function(iPhoneNum, szCode){
    var sendContent = util.format(content, szCode);
    var smsurl = global_config.smsurl + '?u=' + global_config.smsUserName + '&p=' + global_config.smsPasswd + '&m=' + iPhoneNum + '&c=' + sendContent;
    request({url: smsurl}, function (err, res, body) {
        if (!err && res.statusCode == 200) {
	   console.log(body); // 打印google首页
        }
    });
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
            var iRet = _.send(iPhoneNum, num);
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
