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

var publish = function(robot, cb){
    var obj = {};
    obj.iSpaceID = 1;
    obj.tStart = '2015-11-11';
    obj.tEnd = '2015-12-12';
    obj.iMiniRental = 10;
 
    var dist_url = robot_util.makeUrl('/user/pending/publish', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var querymine = function(robot, cb){
    var obj = {};
    obj.iPendingID = 0;
    obj.tStart = '2014-11-11';
    obj.tEnd = '2015-12-12';
    obj.iNum = 10;
    obj.iStatus = 0;
 
    var dist_url = robot_util.makeUrl('/user/pending/querymine', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var query = function(robot, cb){
    var obj = {};
    obj.iCommunityID = 1;
    obj.iPendingID = 0;
    obj.tStart = '2014-11-11';
    obj.tEnd = '2015-12-12';
    obj.iNum = 10;
 
    var dist_url = robot_util.makeUrl('/user/pending/query', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var detail = function(robot, cb){
    var obj = {};
    obj.iPendingID = 4294967297;
 
    var dist_url = robot_util.makeUrl('/user/pending/detail', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var calprice = function(robot, cb){
    var obj = {};
    obj.iChargesType = 497;
    obj.tStart = '2015-09-09 xx';
    obj.tEnd = '2015-09-09 9:11:11'
 
    var dist_url = robot_util.makeUrl('/user/pending/calprice', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var price_get = function(robot, cb){
    var obj = {};
 
    var dist_url = robot_util.makeUrl('/common/charge/get', 0);
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
    //publish,
    //querymine,
    //query,
    //detail,
    //calprice,
    price_get
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

