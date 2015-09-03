'use strict';

var path = require('path');
var util = require('util');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));

var userBiz = {};

userBiz.register = function(params, cb){
    var szSql = 'select *from tbUserInfo_0';
    sqlPool.excute(szSql, cb);
};

userBiz.myInfo = function(params, cb){
    var szSql = 'select * from tbUserInfo where iPhoneNum = ?';
    
};

module.exports = userBiz;
