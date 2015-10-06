'use strict';

global.rootPath = __dirname + '/../../';

var path = require('path');
var util = require('util');
var async = require('async');

var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

redis_mgr.init(0);

async.waterfall([
    function(callback){
	redis_mgr.lpush2(redis_define.enum.USER_SEARCHED, '13917658422', 'xxxxx', function(err, info){
	    callback(null);
	});
    },
    function(callback){
	redis_mgr.lrange(redis_define.enum.USER_SEARCHED, '13917658422', 0, -1, function(err, info){
	    console.error(err);
	    console.error(info);
	    callback(null);
	});
    }
], function(err, results){
});

