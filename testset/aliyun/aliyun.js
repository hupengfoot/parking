global.rootPath = __dirname + '/../../';

var path = require('path');
var aliyunBiz = require(path.join(global.rootPath, 'interfaceBiz/aliyunBiz'));

var init = function(){
    aliyunBiz.init();
};

var uploadObject = function(){
    var fileName = 'IMG_0469.JPG';
    var bucket = 'parking-test1';
    aliyunBiz.uploadObject(fileName, bucket, function(){});
};

init();

uploadObject();

