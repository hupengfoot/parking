var request = require('request');

var formatUrl = function(url, obj){
    url = url + '?';
    for(var i in obj){
	url = url + i + '=' + obj[i];
	if(i <= obj.length - 1){
	    break;
	}
	url = url + '&';
    }
    return url;
}

var createGeoTable = function(){
    var object = {};
    object.name = 'hupengtest1';
    object.geotype = 1;
    object.is_published = 1;
    object.ak = 'tNlhkboHzkSA3ev2Gk46foWO';

    var j = request.jar();
    var post_option = {
	url:'http://api.map.baidu.com/geodata/v3/geotable/create',
	jar:j,
	form:object,
	headers : {
	    'user-agent': 'Robot ender attacker',
	}
    };
    console.log(object);
    request.post(post_option,function(err, res, body){
	console.error(body);
    });
};

var createColumn = function(){
    var object = {
	name : '小区号',
	key : 'iCommunityID',
	type : 1,
	is_sortfilter_field : 0,
	is_search_field : 0,
	is_index_field : 0,
	geotable_id : 119656,
	ak : 'tNlhkboHzkSA3ev2Gk46foWO',
    };

    var j = request.jar();
    var post_option = {
	url:'http://api.map.baidu.com/geodata/v3/column/create',
	jar:j,
	form:object,
	headers : {
	    'user-agent': 'Robot ender attacker',
	}
    };
    console.log(object);
    request.post(post_option,function(err, res, body){
	console.error(body);
    });
};

var createPoi = function(){
    var object = {
	latitude : '111.11',
	longitude : '111.11',
	coord_type : 1,
	iCommunityID : 1,
	geotable_id : 119656,
	ak : 'tNlhkboHzkSA3ev2Gk46foWO',
    };

    var j = request.jar();
    var post_option = {
	url:'http://api.map.baidu.com/geodata/v3/poi/create',
	jar:j,
	form:object,
	headers : {
	    'user-agent': 'Robot ender attacker',
	}
    };
    console.log(object);
    request.post(post_option,function(err, res, body){
	console.error(body);
    });
};

var listPoi = function(){
    var object = {
	geotable_id : 119656,
	ak : 'tNlhkboHzkSA3ev2Gk46foWO'
    };
    var dist_url = formatUrl('http://api.map.baidu.com/geodata/v3/poi/list', object);
    console.error(dist_url);
    var options = {
	url : dist_url,
	headers : {
	    'user-agent': 'Robot ender attacker',
	}
    };
    request(options, function(err, res, body){
	console.error(body);
    });
};

createGeoTable();
//createPoi();
//listPoi();
