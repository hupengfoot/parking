var express = require('express');
var router = express.Router();
var path = require('path');
var url = require('url');
var util = require('util');
var async = require('async');
var fs = require('fs');
var formidable = require('formidable');
var aliyunBiz = require(path.join(global.rootPath, 'interfaceBiz/aliyunBiz'));
var global_config = require(path.join(global.rootPath, 'config/global_conf')).global_config;
var msg = require(path.join(global.rootPath, 'define/msg')).global_msg_define;


//上传配置项
var uploadconfig = {
    "uploaddir":"./upload", //本地缓存目录
    'uploadBucket': global_config.aliyunBucketName
};

//创建本地上传目录
if(!fs.existsSync(uploadconfig.uploaddir)){
	fs.mkdirSync(uploadconfig.uploaddir);
}

router.post('/uploadpic', function(req, res){
    var form = new formidable.IncomingForm();
    form.uploadDir = uploadconfig.uploaddir;
    form.parse(req, function(err, fields, files) {
        if(files.file === null || files.file === undefined){
            msg.wrapper(msg.code.ERR_UPLOAD_ARGS, null, res);
        }else{
	    aliyunBiz.uploadObject(files.file.path, uploadconfig.uploadBucket, function(err, result){
		msg.wrapper(err, result, res);
	    });
	}
    });
});

module.exports = router;
