'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var goods = {};

goods.login = function(cb){
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


goods.publish = function(robot, cb){
    var obj = {};
    obj.szDesc = robot.obj.szDesc;
    obj.szPicUrl = robot.obj.szPicUrl;
    obj.iPrice = robot.obj.iPrice;
    obj.iNum = robot.obj.iNum;
 
    var dist_url = robot_util.makeUrl('/master/goods/publish', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

goods.query = function(robot, cb){
    var obj = {};
    obj.iGoodsID = robot.obj.iGoodsID;
    obj.iNum = robot.obj.iNum;
 
    var dist_url = robot_util.makeUrl('/user/goods/query', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

goods.detail = function(robot, cb){
    var obj = {};
    obj.iGoodsID = robot.obj.iGoodsID;
 
    var dist_url = robot_util.makeUrl('/user/goods/getdetail', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

goods.set = function(robot, cb){
    var obj = {};
    obj.iGoodsID = robot.obj.iGoodsID;
    obj.iDelete = robot.obj.iDelete;

    var dist_url = robot_util.makeUrl('/master/goods/set', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

var L1 = function(robot, cb){
    robot.obj = {};
    robot.obj.szDesc = 'xxxxx';
    robot.obj.szPicUrl = 'xxxxx';
    robot.obj.iPrice = 50;
    robot.obj.iNum = 50;
    cb(null, robot);
};

var L2 = function(robot, cb){
    console.error(robot.result);
    robot.obj.iGoodsID = robot.result.iGoodsID;

    cb(null, robot);
};

var L3 = function(robot, cb){
    robot.obj.iDelete = 1;

    cb(null, robot);
};

var L4 = function(robot, cb){
    cb(null, robot);
};

var test_cases =
[
    goods.login,
    L1,
    goods.publish,
    L2,
    goods.detail,
    L3,
    goods.set,
    L4,
    goods.detail
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

module.exports = goods;
