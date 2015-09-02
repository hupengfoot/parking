'use strict'
global.rootPath = __dirname;

var express = require('express');
var app = express();

app.use(function(req, res, next){
    console.log('hello kitty!');
    next();
})

module.exports = app;
