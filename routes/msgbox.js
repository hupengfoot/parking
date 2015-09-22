var express = require('express');
var path = require('path');
var router = express.Router();
var util = require('util');
var multiparty = require('multiparty');
var fs = require('fs');
var http = require('http');
var crypto = require('crypto');
var url = require('url');
var moment = require('moment');
var global_config = require(path.join(global.rootPath, './config/global_conf')).global_config;
var sqlPool = require(path.join(global.rootPath, "dbaccess/dbparking"));
var msgboxBiz = require(path.join(global.rootPath, "interfaceBiz/msgboxBiz"));
var redis_mgr = require(path.join(global.rootPath, "redis/redis_mgr.js"));
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var redis_define = require(path.join(global.rootPath, "define/redis")).redis_define;
var misc = require(path.join(global.rootPath, "util/misc"));
var sendmsg = require(path.join(global.rootPath, "util/sendMsg"));

var iUserTableCnt = 128;
var msgID = redis_define.msgID;

router.get('/msg/publishmsgtoiphone', function(req, res) {
    var param = req.query;
    msgboxBiz.publishMsgToiPhone(param.iType, param.szArg, param.iPhoneNum, function(iRet){
        console.log("publishmsg success");
        var result = {};
        result.msgID = iRet;
        res.jsonp(msg.getMsg(msg.code.ERR_SUCCESS, result));
    });
});

router.post('/publishmsg', function(req, res) {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        console.log(body);
        try{
            var jsonobj=JSON.parse(body);
        }catch(err){
            console.log(err);
            res.jsonp("json parse error!");
            return;
        }
        redis_mgr.incr2(redis_type_enum.INCREMENT, msgID, function(err, reply){
            var iMsgID = misc.getUniqueID(reply, 0);
            var insertParams = [0, iMsgID, jsonobj.msgtype, jsonobj.msgcontent];
            sqlPool.excute(10141, insertParams, function(err, rows, fields){
            });
            var qqArray = jsonobj.idcontent.split("|");
            var tTime = moment().format('YYYY-MM-DD hh:mm:ss');
            for(var i in qqArray){
                sendmsg.pushMsgToRedis(qqArray[i], iMsgID, jsonobj.msgtype, jsonobj.msgcontent, tTime);
            }
            res.jsonp(msg.getMsg(msg.code.ERR_SUCCESS));
        });
    });
});

module.exports = router;
