'use strict';

var async = require('async');
var robot_util = require('./robot_util');
var login = require('./login');
var community = require('./community');
var space = require('./space');

var L1 = function(robot, cb){
    robot.obj = {};
    robot.obj.iPhoneNum = '13917658422';
    robot.obj.szPasswd = robot_util.encodePasswd('000000');
    cb(null, robot);
};

var L2 = function(robot, cb){
    robot.obj.iChargesType = 0;
    robot.obj.iPer = 1;
    robot.obj.iPerPrice = 2;
    robot.obj.iMaxPrice = 10;
    robot.obj.szX = '10.1236123';
    robot.obj.szY = '10.187263';
    robot.obj.iProvince = 2;
    robot.obj.iCity = 0;
    robot.obj.szCommunityName = '海上新村';
    robot.obj.szAddressName = '漕宝路20008号';
    robot.obj.szPicUrl = 'xxxx';
    cb(null, robot);
};

var L3 = function(robot, cb){
    robot.obj.iCommunityID = robot.result.insertId;
    robot.obj.szParkingNum = 'A-123123';
    robot.obj.iParkingType = 1;
    robot.obj.iParkingNature = 1;
    cb(null, robot);
};

var L4 = function(robot, cb){
    robot.obj.iSpaceID = robot.result.insertId;
    cb(null, robot);
};

var L5 = function(robot, cb){
    console.error('车位' + robot.obj.iSpaceID + '已认证');
    cb(null, robot);
};

var test_cases =
[
    login.getRobot,
    L1,
    login.login,
    L2,
    community.publish,
    L3,
    space.addspace,
    L4,
    space.approve,
    L5,
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

