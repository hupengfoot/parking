/* jshint node:true*/
"use strict";
var express = require('express');
var path = require('path');
var url = require('url');
var util = require('util');
var router = express.Router();
var admin_ip_check = require('../define/admin_ip_check');
var msg = require("../define/msg").global_msg_define;
var admin_query = require("../define/admin_query");
var global_config = require(path.join(global.rootPath, 'config/global_conf')).global_config;

function getClientIp(req) {
    return  req.connection.remoteAddress ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}

router.use(function(req, res, next){
    var remoteIP = getClientIp(req);    
    var pass = true;
    if(global_config.iAdminIPCheckFlag){
    pass = admin_ip_check.check(remoteIP);
        if(!pass){
            res.jsonp(util.format("invalid ip %s", remoteIP));
        } else {
            next();
        }
    } else {
        next();
    }
});

//query参数检查
router.use(function(req, res, next){
    req.body = url.parse(req.url, true).query;
    var length = admin_query.admin_query_define.length;
    for(var i=0; i<length; i++){
        if(admin_query.admin_query_define[i].router == req.path){
            var param = url.parse(req.url, true).query;
            var paramLength = admin_query.admin_query_define[i].query.length;
            for(var j=0; j!=paramLength; ++j){
                if('string' != typeof param[admin_query.admin_query_define[i].query[j]]){
                    console.error("router " + admin_query.admin_query_define[i].router + " param error " + admin_query.admin_query_define[i].query[j]);
                    res.jsonp(msg.getMsg(msg.code.ERR_VALID_QUERY));
                    return;
                }
            }
            req.urlParams = param;
            break;
        }
    }
    next();
});

var user = require(path.join(global.rootPath, 'routes/admin/user'));
router.use('/user', user);

module.exports = router;
