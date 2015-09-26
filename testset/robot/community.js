'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var community = {};

var getRobot = function(cb){
    var robot = {};
    robot.parking_app_key = 0;
    cb(null, robot);
};

var login = function(obj, cb){
    var obj = {};
    obj.iPhoneNum = '13917658422';
    obj.szPasswd = robot_util.encodePasswd('000000');
    console.error(obj.szPasswd);
    var robot = {};
    robot.iPhoneNum = '13917658422';
 
    var dist_url = robot_util.makeUrl('/login', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
	console.error(res.cookies);
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.parking_app_key = result.parking_app_key;
	    cb(null, robot);
        });
    });
};

community.publish = function(robot, cb){
    var obj = {};
    obj.iChargesType = 1;
    obj.iPer = 1;
    obj.iPerPrice = 10;
    obj.iMaxPrice = 10;
    obj.szX = '10.1236123';
    obj.szY = '10.187263';
    obj.iProvince = 1;
    obj.iCity = 1;
    obj.iAreaName = 1;
    obj.szCommunityName = 'xxx';
    obj.szPicUrl = 'xxxx';
    
    var dist_url = robot_util.makeUrl('/community/publish', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
	console.error(res.cookies);
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

community.get = function(robot, cb){
    var obj = {};
    obj.iCommunityID = 1;
    
    var dist_url = robot_util.makeUrl('/community/get', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
	console.error(res.cookies);
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

community.search = function(robot, cb){
    var obj = {};
    obj.szName = 'xx';
    obj.iProvince = 1;
    obj.iCity = 1;
    
    var dist_url = robot_util.makeUrl('/community/search', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
	console.error(res.cookies);
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var test_cases =
[
    getRobot,
    login,
    community.publish,
    //community.get,
    //community.search
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

module.exports = community;
