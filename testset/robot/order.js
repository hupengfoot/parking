'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var order = {};

order.getRobot = function(cb){
    var robot = {};
    cb(null, robot);
};

order.login = function(cb){
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

order.book = function(robot, cb){
    var obj = {};
    obj.iPendingID = robot.obj.iPendingID;
    obj.tStart = robot.obj.tStart;
    obj.tEnd = robot.obj.tEnd;
    obj.szLiensePlate = robot.obj.szLiensePlate;
 
    var dist_url = robot_util.makeUrl('/user/order/book', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

order.detail = function(robot, cb){
    var obj = {};
    obj.iOrderID = 1048577;
 
    var dist_url = robot_util.makeUrl('/user/order/detail', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

order.check = function(robot, cb){
    var obj = {};
    obj.iOrderID = robot.obj.iOrderID;
    obj.szCode = robot.obj.szCode;
    obj.iPassStatus = robot.obj.iPassStatus;
 
    var dist_url = robot_util.makeUrl('/master/order/check', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};


order.queryMine = function(robot, cb){
    var obj = {};
    obj.iOrderID = 0;
    obj.iNum = 10;
    obj.tStart = '2014-11-11';
    obj.tEnd = '2016-11-11';
    obj.iPay = -1;
 
    var dist_url = robot_util.makeUrl('/user/order/querymine', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

order.pay = function(robot, cb){
    var obj = {};
    obj.iOrderID = robot.obj.iOrderID;
 
    var dist_url = robot_util.makeUrl('/user/order/pay', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var L1 = function(robot, cb){
    robot.obj = {};
    robot.obj.iPendingID = 8388613;
    robot.obj.tStart = '2015-09-19 10:00:00';
    robot.obj.tEnd = '2015-09-19 22:00:00';
    robot.obj.szLiensePlate = '沪Axxxxxxx';
    cb(null, robot);
};

var L2 = function(robot, cb){
    robot.obj = {};
    robot.obj.iOrderID = 4194309;
    robot.obj.szCode = 673854;
    robot.obj.iPassStatus = 0;
    cb(null, robot);
};

var test_cases =
[
    order.login,
    //L1,
    //order.book,
    //order.detail,
    //order.queryMine,
    //order.pay,
    L2,
    order.check,
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

module.exports = order;
