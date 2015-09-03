'use strict';

var path = require('path');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));

var userBiz = {};

userBiz.register = function(params, cb){
    var szSql = 'select *from tbUserInfo_0';
    sqlPool.excute(szSql, cb);
};

module.exports = userBiz;
