var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;
var priceDefine = require(path.join(global.rootPath, "config/price"));

router.post('/get', function(req, res){
    var param = url.parse(req.url, true).query;
    msg.wrapper(null, priceDefine, res);
});

module.exports = router;


