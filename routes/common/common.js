var queryCenter = {};
var path = require('path');
var queryDefine = require(path.join(global.rootPath, 'define/query'));
var queryDatabase = [];

var _ = {};
_.freshQuery = function(querys){
    var length = querys.length;
    for(var i=0; i!=length; ++i){
        queryDatabase[querys[i].router] = querys[i];
    }
};

queryCenter.init = function(){
    _.freshQuery(queryDefine.global_query_define);
};

queryCenter.get = function(req){
    var obj = queryDatabase[req.path];
    if(typeof obj == 'undefined'){
        obj = null;
    }
    return obj;
};

module.exports = queryCenter;
