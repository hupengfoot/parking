'use strict'
global.rootPath = __dirname;

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require(path.join(global.rootPath,'util/logger')).logger;
var console_trace = require('debug-trace')({always:true});

var upload = express();

var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var queryCenter = require(path.join(global.rootPath, 'routes/common/common'));
var aliyunBiz = require(path.join(global.rootPath, 'interfaceBiz/aliyunBiz'));
var global_config = require(path.join(global.rootPath, 'config/global_conf')).global_config;

//解析cookie
upload.use(cookieParser());
//解析http body
upload.use(bodyParser({limit : '1mb'}));
upload.use(bodyParser.json());
upload.use(bodyParser.urlencoded());

//各种模块初始化
redis_mgr.init(7776);
queryCenter.init();
aliyunBiz.init();

var routes = require('./routes/upload');
upload.use('/upload', routes);

module.exports = upload;
