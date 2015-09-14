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

var queryspace = function(robot, cb){
    var obj = {};
 
    var dist_url = robot_util.makeUrl('/user/space/queryspace', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var addspace = function(robot, cb){
    var obj = {};
    obj.iCommunityID = 1;
    obj.szParkingNum = 'xxxxx';
    obj.szParkingPic = 'xxxx';
    obj.iParkingType = 1;
    obj.iParkingNature = 1;
 
    var dist_url = robot_util.makeUrl('/user/space/addspace', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var deletespace = function(robot, cb){
    var obj = {};
    obj.iSpaceID = 1;

    var dist_url = robot_util.makeUrl('/user/space/deletespace', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var updatespace = function(robot, cb){
    var obj = {};
    obj.iSpaceID = 0;
    obj.szParkingNum = 'adasd';
    obj.szParkingPic = 'asdasd';
    obj.iParkingType = 1;
    obj.iParkingNature = 1;

    var dist_url = robot_util.makeUrl('/user/space/updatespace', 0);
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
    addspace,
    queryspace,
    updatespace,
    queryspace,
    deletespace,
    queryspace,
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

