global.rootPath = __dirname + '/../../';

var path = require('path');
var searchBiz = require(path.join(global.rootPath,'interfaceBiz/searchBiz'));
var redis_mgr = require(path.join(global.rootPath,'redis/redis_mgr'));
redis_mgr.init(0);

var suggest = function(){
    var szWord = '剑灵';
    searchBiz.suggest(szWord, function(err, answer){
	console.error(answer);
    });
};

suggest();
