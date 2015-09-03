var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');

var userBiz = require(path.join(global.rootPath,'interfaceBiz/userBiz'));

router.get('/register', function(req, res){
    var param = {};
    userBiz.register(param, function(err, rows, fields){
	console.error(rows);
	res.jsonp('hello kitty!\n');
    });
});

module.exports = router;
