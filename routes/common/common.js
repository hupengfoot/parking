var queryCenter = {};
var path = require('path');
var queryDefine = require(path.join(global.rootPath, "define/query"));
var queryDatabase = [];
var redis_mgr = require(path.join(global.rootPath, 'redis/redis_mgr'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;
var file = require(path.join(global.rootPath, 'util/file'));

var _ = {};
_.freshQuery = function(querys){
    var length = querys.length;
    for(var i=0; i!=length; ++i){
        queryDatabase[querys[i].router] = querys[i];
    }
};

queryCenter.init = function(){
    _.freshQuery(queryDefine.global_query_define);
    //如果不存在，先set一下
    file.getMD5(path.join(global.rootPath, 'define/query.js'), function(szMD5){
        if(szMD5){
            var queryObj = {};
            queryObj.define = queryDefine.global_query_define;
            queryObj.md5 = szMD5;
            redis_mgr.setnx2(redis_define.enum.MISC, 'QUERY_ALL', queryObj);
            //如果已经存在了，就用redis里面的
            redis_mgr.get2(redis_define.enum.MISC, 'QUERY_ALL', function(err, obj){
                if(!err && obj){
                    if(!obj.md5 || obj.md5 != szMD5){ //说明redis里面存的是老的数据
                        console.log("query.js config file change!!!");
                        redis_mgr.set2(redis_define.enum.MISC, 'QUERY_ALL', queryObj);
                    }else{
                        _.freshQuery(obj.define);
                    }
                }
            });
        }
    });
    //通过channel发过来的更新，不会更新MD5值
    redis_mgr.regChannel(redis_define.redis_channel_enum.WEB_CONFIG, function(message){
        redis_mgr.get2(redis_type_enum.MISC, 'QUERY_ALL', function(err, obj){
            console.error('fresh query config');
            _.freshQuery(obj.define);
        });
    });
};

queryCenter.get = function(req){
    var obj = queryDatabase[req.path];
    if(typeof obj == 'undefined'){
        obj = null;
    }
    return obj;
};

module.exports = queryCenter;
