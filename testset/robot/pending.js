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



var test_cases =
[
    login,
    publish,
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

