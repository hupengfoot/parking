/* jshint node:true*/
"use strict";
var express = require('express');
var path = require('path');
var morgan = require('morgan');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var console_trace = require('debug-trace')({always:true});

//设置用户根目录
global.rootPath = __dirname;
var global_config = require(path.join(global.rootPath, 'config/global_conf')).global_config;
var redis_mgr = require(path.join(global.rootPath, 'redis/redis_mgr'));
redis_mgr.init(process.argv[3]);
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

var admin = express();

// view engine setup
admin.set('views', path.join(__dirname, 'views'));
admin.set('view engine', 'ejs');

var accessLog = morgan({
    "format":"dev",
    "stream":{write:function(str){console.info(str);}}
});
admin.use(accessLog);
admin.use(bodyParser.json());
admin.use(bodyParser.urlencoded({ extended: false }));
admin.use(cookieParser());
admin.use(express.static(path.join(__dirname, 'public')));

var post_data = require(path.join(global.rootPath, "routes/common/post_data"));
admin.use(post_data);

var routes = require('./routes/admin');
admin.use('/', routes);

module.exports = admin;
