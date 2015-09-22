var express = require('express');
var router = express.Router();
var path = require('path');
var interfaceBiz = require(path.join(global.rootPath, 'interfaceBiz/interfaceBiz'));
var msgboxBiz = require(path.join(global.rootPath, 'interfaceBiz/msgboxBiz'));
var util = require('util');
var url = require('url');
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var raphLog = require(path.join(global.rootPath, 'interfaceBiz/raphLog')).logger;
var getuserinfo = require(path.join(global.rootPath, "util/getUserInfo"));
var commentBiz = require(path.join(global.rootPath,'interfaceBiz/commentBiz'));

router.get('/getusermsg', function(req, res) {
    var param = url.parse(req.url, true).query;
    param.iProductID=0;
    msgboxBiz.getUserMsg(param, 0, function(err, rows, fields){
	    msg.defaultMsgFun(err, rows, fields, res, raphLog);
    });
});

router.get('/searchmsg', function(req, res) {
    var param = url.parse(req.url, true).query;
    msgboxBiz.searchMsg(param, function(err, rows, fields){
	    msg.defaultMsgFun(err, rows, fields, res, raphLog);
    });
});

router.get('/getmysended', function(req, res) {
    var param = url.parse(req.url, true).query;
    msgboxBiz.getMySended(param, function(err, rows){
        if((err && err.errno != 10065) || !rows || rows.length === 0){
            msg.defaultMsgFun(null, {messages:[], iTotal:0, up:[]}, null, res, raphLog);
        }else{
            commentBiz.queryObjectUpUnion(req, rows.messages, function(errup, rowsup, fieldup){
                if(errup && errup.errno != 1065){
                    console.error(errup);
                    msg.defaultMsgFun(errup, {messages:[], iTotal:0, up:[]}, fieldup, res, raphLog);
                }else{
                    var result = {};
                    result.messages = rows.messages;
                    result.totalCnt = rows.totalCnt;
                    result.up = rowsup;
                    msg.defaultMsgFun(errup, result, fieldup, res, raphLog);
                }
            });
        }
    });
});

router.get('/getmsgnum', function(req, res) {
    var param = url.parse(req.url, true).query;
    getuserinfo.getUserInfo(req, function(err, userInfo){
        if(err){
	        console.error(err);
	        res.jsonp(msg.getMsg(msg.code.ERR_QQ));
        }else{
            param.iQQ = userInfo.iQQ;
            msgboxBiz.getMsgNum(param, function(err, rows, fields){
	            msg.defaultMsgFun(err, rows, fields, res, raphLog);
            });
        }
    });
});

module.exports = router;
