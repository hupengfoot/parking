'use strict';

var async = require('async');
var robot_util = require('./robot_util');

var login = {};

login.getRobot = function(cb){
    var robot = {};
    robot.parking_app_key = 0;
    cb(null, robot);
};

login.login = function(robot, cb){
    var obj = {};
    obj.iPhoneNum = '13917658422';
    obj.szPasswd = robot_util.encodePasswd('000000');
 
    var dist_url = robot_util.makeUrl('/login', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
	console.error(res.cookies);
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.parking_app_key = result.parking_app_key;
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

login.logout = function(robot, cb){
    var obj = {};
 
    var dist_url = robot_util.makeUrl('/login/logout', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

login.register = function(robot, cb){
    var obj = {};
    obj.iPhoneNum = robot.obj.iPhoneNum;
    obj.szPasswd = robot.obj.szPasswd;
    obj.szCode = robot.obj.szCode;
    var dist_url = robot_util.makeUrl('/user/user/register', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

login.sms_register = function(robot, cb){
    var obj = {};
    obj.iPhoneNum = robot.obj.iPhoneNum;
    var dist_url = robot_util.makeUrl('/common/sms/register', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};

login.modifypsw = function(robot, cb){
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

login.updatepsw = function(robot, cb){
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

login.updateinfo = function(robot, cb){
    var obj = {};
    obj.szUserName = 'xxx';
    obj.szRealName = 'xxx';
    obj.szMail = 'xxx';
    obj.szLiensePlate = 'xxx';
    obj.szAddress = 'xxx';
    obj.szModels = 'xxx';
    obj.szBankCard = 'xxx';
    obj.szBankAddress = 'xxx';

    var dist_url = robot_util.makeUrl('/user/user/updateinfo', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

login.queryMyInfo = function(robot, cb){
    var obj = {};

    var dist_url = robot_util.makeUrl('/user/user/query', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

login.queryLiensePlate = function(robot, cb){
    var obj = {};

    var dist_url = robot_util.makeUrl('/user/user/querylienseplate', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    cb(null, robot);
        });
    });
};

login.updateLiense = function(robot, cb){
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
    login.getRobot,
    //login.register,
    login.login,
    //login.modifypsw,
    //login.sms_register,
    //login.updatepsw,
    login.updateinfo,
    //login.queryMyInfo,
    //login.queryLiensePlate,
    //login.updateLiense,
    //login.logout,
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

module.exports = login;
