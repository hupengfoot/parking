'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var announce = {};

announce.login = function(cb){
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


announce.publish = function(robot, cb){
    var obj = {};
    obj.szDetailUrl = 'xxxx';
    obj.szImgUrl = 'xxx';
 
    var dist_url = robot_util.makeUrl('/master/announce/publish', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

announce.query = function(robot, cb){
    var obj = {};
    obj.iAnnounceID = 0;
    obj.iNum = 10;
    obj.tPublishTime = '2015-11-11 00:00:00';
 
    var dist_url = robot_util.makeUrl('/user/announce/query', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

var test_cases =
[
    announce.login,
    announce.publish,
    announce.query,
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

module.exports = announce;
