'use strict';
var path = require('path');
var request = require('request');

var global_config = require(path.join(global.rootPath, 'config/global_conf')).global_config;

var baiduMap = {};

baiduMap.createPoi = function(obj){
    obj.geotable_id = global_config.baiduMapGeoTableID;
    obj.ak = global_config.baiduMapAk;
    var j = request.jar();
    var post_option = {
	url:'http://api.map.baidu.com/geodata/v3/poi/create',
	jar:j,
	form:obj,
	headers : {
	    'user-agent': 'Robot ender attacker',
	}
    };
    request.post(post_option,function(err, res, body){
	console.error(body);
    });

};

module.exports = baiduMap;
