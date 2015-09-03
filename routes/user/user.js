var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');

var userBiz = require(path.join(global.rootPath,'interfaceBiz/userBiz'));

router.post('/register', function(req, res){
    var param = url.parse(req.url, true).query;
    console.error(param);
    userBiz.register(param, function(err, rows, fields){
	console.error(rows);
	res.jsonp('hello kitty!\n');
    });
});

module.exports = router;
