'use strict'
global.rootPath = __dirname;

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require(path.join(global.rootPath,'util/logger')).logger;
var console_trace = require('debug-trace')({always:true});

var app = express();

var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
var queryCenter = require(path.join(global.rootPath, 'routes/common/common'));
var aliyunBiz = require(path.join(global.rootPath, 'interfaceBiz/aliyunBiz.js'));
var spaceBiz = require(path.join(global.rootPath, 'interfaceBiz/spaceBiz.js'));
var pendingBiz = require(path.join(global.rootPath, 'interfaceBiz/pendingBiz.js'));
var orderBiz = require(path.join(global.rootPath, 'interfaceBiz/orderBiz.js'));
var userBiz = require(path.join(global.rootPath, 'interfaceBiz/userBiz.js'));
var ossEventMsg = require(path.join(global.rootPath, "oss/ossEventMsg"));
var msgCenter = require(path.join(global.rootPath, 'oss/send'));

//解析cookie
app.use(cookieParser());
//解析http body
app.use(bodyParser({limit : '1mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//各种模块初始化
redis_mgr.init(global.port);
queryCenter.init();
aliyunBiz.init();
spaceBiz.init();
pendingBiz.init();
orderBiz.init();
userBiz.init();
msgCenter.init();
ossEventMsg.init();

var initRoutes = require('./routes/init');
initRoutes(app);

module.exports = app;
