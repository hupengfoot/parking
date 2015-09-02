'use strict'
global.rootPath = __dirname;

var express = require('express');
var path = require('path');
var app = express();

var logger = require(path.join(global.rootPath,'util/logger')).logger;

app.use(function(req, res, next){
    next();
})

module.exports = app;
