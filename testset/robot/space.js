'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var space = {};

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

space.queryspace = function(robot, cb){
    var obj = {};
 
    var dist_url = robot_util.makeUrl('/user/space/queryspace', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

space.detail = function(robot, cb){
    var obj = {};
    obj.iSpaceID = robot.obj.iSpaceID;
 
    var dist_url = robot_util.makeUrl('/user/space/detail', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

space.list = function(robot, cb){
    var obj = {};
    obj.iCommunityID = 5;
 
    var dist_url = robot_util.makeUrl('/master/space/list', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};



space.addspace = function(robot, cb){
    var obj = {};
    obj.iCommunityID = 5;
    obj.szParkingNum = 'xxxxx';
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

space.deletespace = function(robot, cb){
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

space.updatespace = function(robot, cb){
    var obj = {};
    obj.iSpaceID = 3;
    obj.szParkingNum = 'adasd';
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

space.masterupdatespace = function(robot, cb){
    var obj = {};
    obj.iSpaceID = 0;
    obj.szParkingNum = 'adasd';
    obj.szParkingPic = 'asdasd';
    obj.iParkingType = 1;
    obj.iParkingNature = 1;

    var dist_url = robot_util.makeUrl('/master/space/updatespace', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};



space.approve = function(robot, cb){
    var obj = {};
    obj.iSpaceID = 2;

    var dist_url = robot_util.makeUrl('/master/space/approve', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var L1 = function(robot, cb){
    robot.obj = {};
    robot.obj.iSpaceID = 2;
    cb(null, robot);
};

var test_cases =
[
    login,
    //space.addspace,
    //space.masterupdatespace,
    //space.approve,
    //space.queryspace,
    space.updatespace,
    //space.queryspace,
    //space.deletespace,
    //space.queryspace,
    //L1,
    //space.detail,
    //space.list
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

module.exports = space;
