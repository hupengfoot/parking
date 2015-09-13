'use strict';

var ALY = require('aliyun-sdk');
var path = require('path');
var fs = require('fs');
var global_config = require(path.join(global.rootPath, 'config/global_conf')).global_config;

var oss = null; //阿里云sdk句柄
var aliyunBiz= {};

aliyunBiz.init = function(){
    oss = new ALY.OSS({
	"accessKeyId": global_config.aliyunAccessKeyID,
	"secretAccessKey": global_config.aliyunSecretAccessKey,
	endpoint: global_config.aliyunEndPoint,
	apiVersion: global_config.aliyunApiVersion
    });
};

aliyunBiz.uploadObject = function(fileName, bucket, cb){
    fs.readFile(fileName, function (err, data) {
	if(err){
	    console.log('error:', err);
	    cb(err);
	}else{
	    oss.putObject({
	        Bucket: bucket,
	        Key: fileName,                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
	        Body: data,
	        AccessControlAllowOrigin: '',
	        ContentType: 'text/plain',
	        CacheControl: 'no-cache',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
	        ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
	        ContentEncoding: 'utf-8',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
	        ServerSideEncryption: 'AES256',
	    	//Expires: '1442149110000'                       // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.21
	    },
	    function(err, data){
	        if(err){
		   console.log('error:', err);
		   cb(err);
	        }else{
		    var result = {};
		    result.bucket = bucket;
		    result.endpoint = global_config.aliyunEndPoint;
		    result.url = fileName;
		    cb(err, result);
		    console.log('success:', data);
		}
	    });
	}
    });
};

module.exports = aliyunBiz;
