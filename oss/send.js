"use strict";
var path = require('path');
var user_msg_define = require(path.join(global.rootPath, "define/userMsg"));
var redis_mgr = require(path.join(global.rootPath, "redis/redis_mgr"));
var eventMgr = require(path.join(global.rootPath, 'util/eventMgr'));
var eventDefine = require(path.join(global.rootPath, 'define/event'));

var msgSender = {};

msgSender.define = user_msg_define;

var typeDefine = {};
var msgMakerFunc = {};

msgSender.init = function(){
    var iLen = user_msg_define.event.length;
    for(var i=0; i!=iLen; ++i){
        typeDefine[user_msg_define.event[i].iType] = user_msg_define.event[i];
        var event = user_msg_define.event[i];
        msgMakerFunc[event.iType] = {};
        msgMakerFunc[event.iType].func = event.func;
    }
};


msgSender.send = function(iType, message){
    var msg = {};
    msg = typeDefine[iType];
    if(typeof msg === 'undefined'){
        console.error("invalid msg type:"+iType);
        return;
    }

    msg.szArg = message;
    console.log('msgCenter send msg iType %d',iType);

    var eventObj = {
        iType : iType,
        msg : msg,
    };

    eventMgr.emit(eventDefine.enumType.MSG_SEND, eventObj);
};

module.exports = msgSender;


