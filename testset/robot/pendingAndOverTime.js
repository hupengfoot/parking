'use strict';

var async = require('async');
var robot_util = require('./robot_util');
var login = require('./login');
var pending = require('./pending');
var order = require('./order');
var user = require('./user');

var L1 = function(robot, cb){
    robot.obj = {};
    robot.obj.iPhoneNum = '13917658422';
    robot.obj.szPasswd = robot_util.encodePasswd('000000');
    cb(null, robot);
};

var L2 = function(robot, cb){
    robot.obj.iSpaceID = 9;
    robot.obj.tStart = '2015-10-03 14:45:00';
    robot.obj.tEnd = '2015-10-03 14:48:00';
    robot.obj.iMiniRental = 0;
    cb(null, robot);
};

var L3 = function(robot, cb){
    cb(null, robot);
};

var test_cases =
[
    login.getRobot,
    L1,
    login.login,
    L2,
    pending.publish,
    L3,
    user.query,
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

