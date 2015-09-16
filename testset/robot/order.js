'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var getRobot = function(cb){
    var robot = {};
    cb(null, robot);
};

var login = function(cb){
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

var book = function(robot, cb){
    var obj = {};
    obj.iPendingID = 4194309;
    obj.tStart = '2015-11-11';
    obj.tEnd = '2015-11-11 08:00:00';
    obj.szLiensePlate = 'xxxxx';
 
    var dist_url = robot_util.makeUrl('/user/order/book', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var detail = function(robot, cb){
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

var check = function(robot, cb){
    var obj = {};
    obj.iOrderID = 1048577;
    obj.szCode = 'xxx';
    obj.iPassStatus = 1;
 
    var dist_url = robot_util.makeUrl('/master/order/check', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};


var queryMine = function(robot, cb){
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

var pay = function(robot, cb){
    var obj = {};
    obj.iOrderID = 1048577;
 
    var dist_url = robot_util.makeUrl('/user/order/pay', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};





var test_cases =
[
    login,
    book,
    //detail,
    //queryMine,
    //pay,
    //check,
];

function test_main() {
    (function(){
        async.waterfall(test_cases,function(err,end_robot){
            if(err){
                console.error(err);
            }else{
                console.log("all testcase passed");
                console.error(end_robot);
            }
        });
    })();
}

if (require.main === module) {
    test_main();
}

