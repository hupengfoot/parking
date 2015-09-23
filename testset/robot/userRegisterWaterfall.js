'use strict';

var async = require('async');
var robot_util = require('./robot_util');
var login = require('./login');

var L1 = function(robot, cb){
    robot.obj = {};
    robot.obj.iPhoneNum = '13917658422';
    cb(null, robot);
};

var L2 = function(robot, cb){
    robot.obj.szPasswd = robot_util.encodePasswd('000000');
    robot.obj.szCode = robot.result.szCode;
    cb(null, robot);
};

var L3 = function(robot, cb){
    cb(null, robot);
};

var test_cases =
[
    login.getRobot,
    L1,
    login.sms_register,
    L2,
    login.register,
    L3,
    login.login,

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

