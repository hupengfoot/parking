'use strict';

var url = require('url');
var assert = require('assert');
var async = require('async');
var request = require('request');
var crypto = require('crypto');  

var robot_util = {};

var config = require('./robot_config');

robot_util.config = config;

//将参数数组拼接成 URL字符串
robot_util.arrToUrl = function arrToUrl(arr){
    if(arr === 0){
        return '';
    } 
    var search = '?';
    for(var key in arr){
        search += key + '=' + arr[key] + '&';
    }
    //删除最后一个&
    return search.substring(0,search.length - 1);
};

robot_util.encodePasswd = function(szPasswd){
    var alg = 'des-ecb';
    var autoPad = true;
    var key = new Buffer('01234567');
    var iv = new Buffer(0);

    var cipher = crypto.createCipheriv(alg, key, iv);  
    cipher.setAutoPadding(autoPad)  //default true  
    var ciph = cipher.update(szPasswd, 'utf8', 'hex');  
    ciph += cipher.final('hex');
    return ciph;
};

function format_url(host,path,obj){
    var search_str = robot_util.arrToUrl(obj);
    var param = {
    protocol : 'http',
    host     : host,
    pathname : path,
    search   : search_str,
    };
    console.log("url: %s", path + search_str);
    return url.format(param);
}

//生成访问www的URL
//obj为0时生成post
robot_util.makeUrl = function makeUrl(path,obj){
    return format_url(config.host,path,obj);
};

//统一检查返回值
function checkRes(body,cb){
    if(!body || body.indexOf('Cannot GET') > -1){
        console.error('404 error check url');
        cb(-1);
    }else{
        var param = [];
        try{
            param = JSON.parse(body);
        }catch(err){
            console.error("parse body error in check res");
            cb(body);
        }
        if(param.errCode === 0 && param.msg ==="success"){
            console.log('pass...');
            cb(null,param.result);
        }else{
            console.error(param);
            cb(param.msg);
        }
    }
}

//带key的POST请求  
robot_util.postWithKey = function(robot,dist_url,object,cb){
    var j = request.jar();
    var cookie = request.cookie('key=' + robot.key);
    j.setCookie(cookie,'http://' + config.host ,function(err,cookie){});
    var post_option = {
        url:dist_url,
        jar:j,
        form:object,
        headers : {
            'user-agent': 'Robot ender attacker',
        }
    };
    console.log(object);
    request.post(post_option,cb);
};


module.exports = robot_util;
//统一检查返回值
robot_util.checkRes = checkRes;
