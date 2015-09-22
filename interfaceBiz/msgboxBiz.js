var path = require('path');
var util = require('util'); 
var async = require('async');
var moment = require('moment');

var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var redis_mgr = require(path.join(global.rootPath, "redis/redis_mgr.js"));
var sqlDefine = require(path.join(global.rootPath, 'sql/mysql_define'));
var misc = require(path.join(global.rootPath, 'util/misc'));
var msgbox_define = require(path.join(global.rootPath, 'define/msgbox'));
var sendmsg = require(path.join(global.rootPath, 'util/sendMsg.js'));
var mysql_define = require(path.join(global.rootPath, 'sql/mysql_define'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

var msgboxBiz = {};
var _ = {};
var limitTotalCnt = 200;

var messageInfoCnt = mysql_define.getTableCount('tbMessageInfo');
var messageBoxCnt = mysql_define.getTableCount('tbMessageBox');

msgboxBiz.publishMsgToiPhone = function(iType, szArg, iPhoneNum, callback){
    if(msgbox_define.global_msgbox_msg_func_define && 
    msgbox_define.global_msgbox_msg_func_define[iType]){
        /*jshint ignore:start*/
        eval(msgbox_define.global_msgbox_msg_func_define[iType].opFunc + "(iType, szArg, iPhoneNum, callback)");
        /*jshint ignore:end*/
    }else{
        console.error("err msg type %d", iType);
    }
};

msgboxBiz.popMsg = function(iQQ, szTableName, callback){
    redis_mgr.llen(redis_type_enum.notifyMsgPrefix, iQQ, function(err, len){
        if(err){ console.error(err);}
        var iCount = 0;
        var aMsgs = [];
        async.whilst(
            function() {return iCount < len; },
            function(cb){
                redis_mgr.lpop2(redis_type_enum.notifyMsgPrefix, iQQ, function(err, value){
                    if(err){
                        console.error(err);
                    }
                    var msg = JSON.parse(value);
                    if(msg === null || msg === undefined){
                        cb(null);
                    }else{
                        aMsgs.push({iMsgID:msg.iMsgID, iType:msg.iType});
                        cb(null);
                    }
                });
                iCount++;
            },function(err){
                var szParam = '';
                if(aMsgs.length > 0){
                    var temp = [];
                    for(var i=0; i!=aMsgs.length; ++i){
                        var szMsg = '';
                        var iProductID = misc.getEndID(aMsgs[i].iMsgID);
                        szMsg = util.format("(%d,%d,%d,%d,now())", iProductID, iQQ, aMsgs[i].iMsgID, aMsgs[i].iType);
                        temp.push(szMsg);
                    }
                    szParam = temp.join(',');
                    sqlPool.excute(10604, [szTableName, szParam], function(err, rows, field){
                        if(err){ console.error(err);}
                        callback(aMsgs.length);
                    });
                }else{
                    callback(aMsgs.length);
                }
            }
        );
    });
};

/*
 * param 包括iQQ, iType, iPageNum, iPageSize, iMsgID, iProductID
 * iHot 如果不为零，表示从最近的200条中，选热度大于iHot的20调
 * iSended 如果不为零，则标识从用户的发送表内筛选数据
 * iReaded 如果不为零，则会更新玩家的未读数据，并插入tbMessageBox
 */
msgboxBiz._getMsg = function(param, iHot, iSended, iReaded, callback_return){
    var iStart = parseInt(param.iPageNum) * parseInt(param.iPageSize);
    var iEnd = parseInt(param.iPageSize);
    var tableName = '';
    if(iSended === 0){
        var tableNum = Math.floor(param.iQQ/10000) % iMessageInfoCnt;
        tableName = "tbMessageBox_" + tableNum;
    }else{
        tableName = 'tbMessageSender_' + param.iQQ % iMessageSenderCnt;
    }
    var typeArray = param.iType.split("|");
    var szTypes = param.iType.replace(/\|/g, ',');
    var szSpecWhere = "";
    param.iMsgID = parseInt(param.iMsgID);
    if(param.iMsgID !== 0 && !isNaN(param.iMsgID)){
        szSpecWhere = "and iMsgID < " + param.iMsgID;
    }
    if(parseInt(param.iProductID) !== 0){
        var szProductID = param.iProductID.replace(/\|/g, ','); 
        szSpecWhere += " and iProductID in (" + szProductID + ")";
    }
    async.waterfall([
        function(callback){ //get msg from redis and insert to user messagebox table
            if(iReaded !== 0){
                msgboxBiz.popMsg(param.iQQ, tableName, function(iLen){callback(null);});
            }else{
                callback(null);
            }
        },function(callback){//set unread msg to zero
            if(iReaded !== 0){
                for(var i in typeArray ){
                    var key = redis_define.notifyCnt[typeArray[i]] + param.iQQ;
                    redis_mgr.set2(redis_type_enum.MSGNUM,key, 0);
                }
            }
            callback(null);
        },function(callback){//拉取 tbMessageBox or tbMessageSender
            var boxParam = [tableName, param.iQQ, szTypes, szSpecWhere, iStart, iEnd];
            sqlPool.excute(601, boxParam, function(err, rows, field){
                if(err || !rows || rows.length === 0){
                    if(err){
                        console.error(err);
                    }else{
                        err = true;
                    }
                    callback(err);
                }else{
                    callback(null, rows);
                }
            });
        },function(boxRows, callback){ //拉取tbMessageInfo
            var msgIDResult = misc.classifyMsgID(boxRows);
            var msgIDResultLen = misc.getJsonObjLength(msgIDResult);
            var szLike = '';
            if(iHot > 0) {szLike = util.format('and (iHeartCnt>%d or iCommentCnt>%d)', iHot, iHot);}  
            var szSql = misc.sqlUnion(msgIDResult, msgIDResultLen, szLike);
            if(iHot > 0) {szSql += ' limit 20 ';}
            sqlPool.query(szSql,function(err1, rows1, fields1){
                if(err1){
                    console.error(err1);
                    callback(err1);
                }else{
                    var totalParam = [tableName, param.iQQ, szTypes, szSpecWhere, iStart];
                    sqlPool.excute(600, totalParam, function(errTotal, totalRow, fieldTotal){
                        if(errTotal){
                            totalRow = [{cnt:0}];
                            console.error(errTotal);
                        }
                        callback(errTotal, {messages:rows1, totalCnt:totalRow[0].cnt}, fieldTotal);
                    });
                }
            });
        }
    ],function(err, result){
        if(err){
            callback_return(null, {messages:[], totalCnt:0});
        }else{
            callback_return(err, result);
        }
    });
};

msgboxBiz.getUserMsg = function(param, iHot, callback_return){
    msgboxBiz._getMsg(param, iHot, 0, 1, callback_return);
};

msgboxBiz.getMsgNum = function(param, callback){
    var typeArray = param.iType.split("|");
    var typeArrayLen = typeArray.length;
    var result = {};
    var i = 0;
    async.whilst(
        function(){return i < typeArrayLen;}, 
        function(cb){
            if(redis_define.notifyCnt[typeArray[i]] === null || (typeof redis_define.notifyCnt[typeArray[i]] == 'undefined')){
                i++;
                cb(0, 1);
            }else{
                var key = redis_define.notifyCnt[typeArray[i]] + param.iQQ;
                redis_mgr.get2(redis_define.enum.MSGNUM , key, function(err, reply){
                    if(err){
                        cb(-1);
                    }else{
                        result[typeArray[i]] = reply;
                        i++;
                        cb(0, 1);
                    }
                });
            }
        }, 
        function(err){
            callback(err, result);
        }
    );
};

function opCommonMsg(iType, szArg, iPhoneNum, callback){
    console.log("onCommonMsg   iType =" + iType);
    publishMsg(iType, szArg, iPhoneNum, callback);
}

//存入redis的格式为{"iMsgID":"xx","iType":"xx","sMsg":"xx","tTime":"xx"}
function publishMsg(iType, sMsg, iPhoneNum, callback){
    iType = parseInt(iType);
    redis_mgr.incr2(redis_type_enum.INCREMENT, redis_define.msgID, function(err, reply){
	var tail = iPhoneNum % Math.floor(iPhoneNum/10000);
        var iMsgID = misc.getUniqueID(reply, tail); //TODO 按QQ分表解决整形溢出问题
        var tTime = moment().format('YYYY-MM-DD hh:mm:ss');
        //MessageInfo表按 QQ / 10000 再 % 128 分表
        var tableNum = tail % messageInfoCnt;
	sqlPool.excute(20011, [tableNum, iMsgID, iType, sMsg.szContent, sMsg.szTitle], function(err, rows, fields){
	});
        sendmsg.pushMsgToRedis(iPhoneNum, iMsgID, iType, sMsg, tTime);
        callback(iMsgID);
    });
}

module.exports = msgboxBiz;
