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

var logout = function(robot, cb){
    var obj = {};
 
    var dist_url = robot_util.makeUrl('/login/logout', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var register = function(robot, cb){
    var obj = {};
    obj.iPhoneNum = '13917658422';
    obj.szPasswd = robot_util.encodePasswd('000000');
    var robot = {};
    robot.parking_app_key = 'xxx';
    var dist_url = robot_util.makeUrl('/user/user/register', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var sms_register = function(robot, cb){
    var obj = {};
    obj.iPhoneNum = '13917658422';
    var robot = {};
    var dist_url = robot_util.makeUrl('/common/sms/register', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(body);
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var modifypsw = function(robot, cb){
    var obj = {};
    obj.szPasswd = robot_util.encodePasswd('000000');
    obj.szOldPasswd = robot_util.encodePasswd('111111');
    var dist_url = robot_util.makeUrl('/user/user/modifypsw', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var updatepsw = function(robot, cb){
    var obj = {};
    obj.iPhoneNum = '13917658422';
    obj.szCode = '718530';
    obj.szPasswd = robot_util.encodePasswd('000000');
    var dist_url = robot_util.makeUrl('/user/user/updatepsw', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var updateinfo = function(robot, cb){
    var obj = {};
    obj.szUserName = 'xxx';
    obj.szRealName = 'xxx';
    obj.szMail = 'xxx';
    obj.szLiensePlate = 'xxx';
    obj.szAddress = 'xxx';
    obj.szModels = 'xxx';
    obj.szBankCard = 'xxx';

    var dist_url = robot_util.makeUrl('/user/user/updateinfo', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var queryMyInfo = function(robot, cb){
    var obj = {};

    var dist_url = robot_util.makeUrl('/user/user/query', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var queryLiensePlate = function(robot, cb){
    var obj = {};

    var dist_url = robot_util.makeUrl('/user/user/querylienseplate', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

var updateLiense = function(robot, cb){
    var obj = {};
    obj.szLiensePlate = 'yyyyyy';

    var dist_url = robot_util.makeUrl('/user/user/updateliense', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};


var test_cases =
[
    //getRobot,
    //register,
    login,
    //modifypsw,
    //sms_register,
    //updatepsw,
    //updateinfo,
    queryMyInfo,
    //queryLiensePlate,
    //updateLiense,
    logout,
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

