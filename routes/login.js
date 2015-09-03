var express = require('express');
var router = express.Router();
var path = require('path');
var url = require('url');
var util = require('util');

router.post('/', function(req, res){
    var param = url.parse(req.url, true).query;
    console.error(param);
    res.jsonp('login!\n');
});

module.exports = router;
