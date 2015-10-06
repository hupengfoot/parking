'use strict'

var path = require('path');
var util = require('util');
var async = require('async');

var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;


var misc = {};

misc.getiPhoneNumTail = function(iPhoneNum){
    return iPhoneNum % Math.floor(iPhoneNum / 10000);
};

//低20位为小区号，接入小区阈值为10W
misc.getUniqueID = function(iID1, iID2){
    if(iID2 < 0){
        iID2 = 0;
    }
    return iID1 * Math.pow(2, 20) + parseInt(iID2);
};

misc.getTopID = function(iID){
    return Math.floor(iID / Math.pow(2, 20));
};

misc.getEndID = function(iID){
    return iID % Math.pow(2, 20);
};

misc.getTimeLimit = function(params){
    var szWhere = '';
    if(params.tStart !== null && params.tStart !== undefined && params.tStart.length > 0){
	szWhere = szWhere + " and unix_timestamp(tStart) >= unix_timestamp('" + params.tStart + "') " ;
    }
    if(params.tEnd !== null && params.tEnd !== undefined && params.tEnd.length > 0){
	szWhere = szWhere + " and unix_timestamp(tStart) <= unix_timestamp('" + params.tEnd + "') " ;
    }
    return szWhere;
};

misc.getSectionTimeLimit = function(params){
    var szWhere = '';
    if(params.tStart !== null && params.tStart !== undefined && params.tStart.length > 0){
	szWhere = szWhere + " and unix_timestamp(tStart) <= unix_timestamp('" + params.tStart + "') " ;
    }
    if(params.tEnd !== null && params.tEnd !== undefined && params.tEnd.length > 0){
	szWhere = szWhere + " and unix_timestamp(tEnd) >= unix_timestamp('" + params.tEnd + "') " ;
    }
    return szWhere;
};

//正常函数模式
misc.checkParaParam = function checkParams(str){
    var vaild = true;
    var arr;
    if(typeof str === 'string' && str.length > 0){
        arr = str.split('|');
        if(arr.length > 0){
            arr = arr.map(function(one){
                //不为空且是有效的数字
                if(one && one.length > 0 && !isNaN(one)){
                    return parseInt(one,10);
                }else{
                    vaild = false;
                    return -1;
                }
            });
        }else{
            vaild = false;
        }
    }else{
        vaild = false;
    }
    if (vaild) {
       return arr; 
    } else {
       return null; 
    }
};

misc.changeOffenSearch = function(iCommunityID, iPhoneNum){
    async.waterfall([
	function(callback){
	    redis_mgr.rpush2(redis_define.enum.USER_SEARCHED, iPhoneNum, iCommunityID, function(err, info){
		callback(null);
	    });
	},
	function(callback){
	    redis_mgr.llen(redis_define.enum.USER_SEARCHED, iPhoneNum, function(err, info){
		if(!err && info > 5){ //最多存储5个常搜小区
		    redis_mgr.lpop2(redis_define.enum.USER_SEARCHED, iPhoneNum, function(){
		    });
		    callback(null);
		}else{
		    callback(null);
		}
	    });
	}
    ], function(err, results){
    });
};

module.exports = misc;
