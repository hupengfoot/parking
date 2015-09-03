var express = require('express');
var router = express.Router();
var path = require('path');
var url = require('url');
var util = require('util');

var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

router.post('/', function(req, res){
    var param = url.parse(req.url, true).query;
    console.error(param);
    redis_mgr.set2(redis_define.enum.LOGIN, param.iPhoneNum, 'xxxx');
    res.jsonp('login!\n');
});

module.exports = router;
