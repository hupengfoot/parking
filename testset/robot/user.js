'use strict'

var async = require('async');
var robot_util = require('./robot_util');

var user = {};

user.query = function(robot, cb){
    var obj = {};

    var dist_url = robot_util.makeUrl('/user/user/query', 0);
    robot_util.postWithKey(robot, dist_url, obj, function(err, res, body){
        robot_util.checkRes(body, function(err, result){
	    console.error(result);
	    robot.result = result;
	    cb(null, robot);
        });
    });
};


module.exports = user;
