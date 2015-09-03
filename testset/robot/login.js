'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var login = function(cb){
    var obj = {};
    obj.iPhoneNum = '13917658422';
    obj.szPasswd = '000000';
    var robot = {};
    robot.key = 'xxx';
 
    var dist_url = robot_util.makeUrl('/login', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
        });
    });

};

var register = function(cb){
    var obj = {};
    obj.iPhoneNum = 1111;
    obj.szCode = 'xxx';
    var robot = {};
    robot.key = 'xxx';
    var dist_url = robot_util.makeUrl('/user/user/register', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
        });
    });
};

var test_cases =
[
    login,
    //register,
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

