'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var getRobot = function(cb){
    var robot = {};
    robot.parking_app_key = 0;
    cb(null, robot);
};

var login = function(cb){
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

var community_publish = function(robot, cb){
    var obj = {};
    obj.iChargesType = 1;
    obj.iX = 10;
    obj.iY = 10;
    obj.iProvince = 1;
    obj.iCity = 1;
    obj.szAreaName = 'xxxx';
    obj.szComminityName = 'xxx';
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

var community_get = function(robot, cb){
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

var community_search = function(robot, cb){
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
    login,
    //community_publish,
    //community_get,
    community_search
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

