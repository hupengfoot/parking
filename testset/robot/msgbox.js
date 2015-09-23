'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var msgbox = {};

msgbox.getRobot = function(cb){
    var robot = {};
    cb(null, robot);
};

msgbox.login = function(robot, cb){
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

msgbox.querymsg = function(robot, cb){
    var obj = {};
    obj.iMessageID= 0;
    obj.iNum = 10;
    obj.iType = -1;
    obj.tPublishTime = '2015-11-11 00:00:00';

    var dist_url = robot_util.makeUrl('/user/msg/querymsg', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.parking_app_key = result.parking_app_key;
	    cb(null, robot);
        });
    });
};

var test_cases =
[
    msgbox.getRobot,
    msgbox.login,
    msgbox.querymsg
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

module.exports = msgbox;
