
var redis_node = require('redis');
var path = require('path');
var config = require(path.join(global.rootPath, "config/redis"));

var redis_mgr = {};
var _ = {};
var redis_inst;

_.connect = function(port, ip, pwd){
    var redis_inst = redis_node.createClient(port, ip, {max_attempts:5});
    redis_inst.auth(pwd, function (err) { if (err) throw err; });
    redis_inst.on('error', function(err){
        _.onError(err, redis_inst);
    });
    redis_inst.on('connect', function(err){
        _.onConnect(redis_inst);
    });
    redis_inst.on('end', function(err){
        _.onEnd(err, redis_inst);
    });
    return redis_inst;
};

_.onConnect = function(redis_inst){
    console.log("redis %s:%d connect success", redis_inst.connectionOption.host,
               redis_inst.connectionOption.port);
};

_.onEnd = function(err, redis_inst){
    // TCP Connection disconnected
    console.error("REDIS: connection to redis is disconnected!!!");
    //console.error("err=", err);
    //console.error("redis_inst=", redis_inst);
};


_.onError = function(err, redis_inst){
    console.error("Redis Error occupied, have configuration(s) err %s", JSON.stringify(err));
};

redis_mgr.init = function(){
    console.error(config);
    redis_inst = _.connect(config[0].szRedisPort, config[0].szRedisIP, config[0].szPwd);
};

module.exports = redis_mgr;
