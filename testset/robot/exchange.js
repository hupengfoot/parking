'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var exchange = {};

exchange.login = function(cb){
    var obj = {};
    obj.iPhoneNum = '13917658422';
    obj.szPasswd = robot_util.encodePasswd('000000');
    var robot = {};
    robot.iPhoneNum = '13917658422';
 
    var dist_url = robot_util.makeUrl('/login', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.parking_app_key = result.parking_app_key;
	    cb(null, robot);
        });
    });
};

exchange.exchange = function(robot, cb){
    var obj = {};
    obj.iGoodsID = robot.obj.iGoodsID;
    obj.iNum = robot.obj.iNum;
 
    var dist_url = robot_util.makeUrl('/user/exchange/exchange', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

exchange.query = function(robot, cb){
    var obj = {};
    obj.iExchangeID = robot.obj.iExchangeID;
    obj.iNum = robot.obj.iNum;
 
    var dist_url = robot_util.makeUrl('/user/exchange/query', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

var L1 = function(robot, cb){
    robot.obj = {};
    robot.obj.iGoodsID = 1;
    robot.obj.iNum = 2;
    cb(null, robot);
};

var L2 = function(robot, cb){
    robot.obj.iExchangeID = 0;
    robot.obj.iNum = 10;
    cb(null, robot);
};

var test_cases =
[
    exchange.login,
    L1,
    exchange.exchange,
    L2,
    exchange.query,
];

function test_main() {
    (function(){
        async.waterfall(test_cases,function(err,end_robot){
            if(err){
                console.error(err);
            }else{
                console.log("all testcase passed");
            }
        });
    })();
}

if (require.main === module) {
    test_main();
}

module.exports = exchange;
