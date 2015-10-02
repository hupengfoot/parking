'use strict';

var async = require('async');
var robot_util = require('./robot_util');
var login = require('./login');
var pending = require('./pending');
var order = require('./order');

var L1 = function(robot, cb){
    robot.obj = {};
    robot.obj.iPhoneNum = '13917658422';
    robot.obj.szPasswd = robot_util.encodePasswd('000000');
    cb(null, robot);
};

var L2 = function(robot, cb){
    robot.obj.iSpaceID = 2;
    robot.obj.tStart = '2015-09-30 08:00:00';
    robot.obj.tEnd = '2015-10-01 22:00:00';
    robot.obj.iMiniRental = 4;
    cb(null, robot);
};

var L3 = function(robot, cb){
    robot.obj.iPendingID = robot.result.iPendingID;
    robot.obj.tStart = '2015-09-24 10:00:00';
    robot.obj.tEnd = '2015-09-24 22:00:00';
    robot.obj.szLiensePlate = '沪Axxxxxxx';
    cb(null, robot);
};

var L4 = function(robot, cb){
    robot.obj.iOrderID = robot.result.iOrderID;
    cb(null, robot);
};

var L5 = function(robot, cb){
    console.error(robot.result);
    robot.obj.iPassStatus = 0;
    robot.obj.szCode = robot.result.szCode;
    cb(null, robot);
};

var L6 = function(robot, cb){
    robot.obj.iPassStatus = 1;
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
    order.book,
    L4,
    order.pay,
    L5,
    order.check,
    L6,
    order.check
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

