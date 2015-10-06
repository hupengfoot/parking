/*
如果发生redis挂掉的事故，按照设计会自动切换从库。
1、从库的配置在define/redis.json中
2、如果发生主库挂掉，并发生client挂掉(例如www挂掉)，配置不需要
   也不应该修改，启动的时候会自动链接主库-失效-从库.
3、主库失效，会又一次重试，重试时间可以参考配置，不易过长，失效期间的请求没有保证。
    配置参考（https://github.com/mranney/node_redis）
4、主库的恢复，千万要注意、千万要注意，不要配置主库自动重启
    原因参考（http://redis.io/topics/replication）
*/
var path = require("path");
var redis_node = require('redis');
var fs = require('fs');
var async = require('async');
var assert = require("assert");
var uuid = require('node-uuid');
var S = require('string');
var util = require('util');
var fs = require('fs');

var debugTool = require(path.join(global.rootPath, 'util/debugTool'));
var redis_define = require(path.join(global.rootPath, 'define/redis')).redis_define;

var redis_array = [];
var redis_sub;

var redis_config;
var redis_type = [];
var redis_timer = [];
var redis_channel = [];
var redis_channel_name = [];
var redis_channel_num = [];
var curPort = 0;
var max_redis_time = 0;
var szTimerSetKey = '';

global.redis_profile_type = [];
global.redis_count = 0;

var redis_mgr = {};

var _ = {};

_.get_name = function(iType, key){
    if(typeof redis_type[iType] == 'undefined'){
        console.error("redis type error "+iType);
        assert(false, "redis type error "+iType);
    }
    return redis_type[iType].Pre + "_" + key;
};

_.getRedis = function(iType){
    if(typeof redis_type[iType] == 'undefined'){
        console.error("redis type error "+iType);
        assert(false, "redis type error "+iType);
    }
    if(redis_type[iType].iIndex) return redis_array[redis_type[iType].iIndex];
    return redis_array[0];
};

//检查某个channel是否存活, cb:function(bool)
_.checkAlive = function(name, cb){
    redis_array[0].pubsub('NUMSUB', name, function(err, aNums){
        if(err){
            console.error('fail to check channel alive %s', name);
            console.error(err);
            cb(false);
        }else{
            var iNum = aNums[1];
            cb(iNum !== 0);
        }
    });
};

_.onMessage = function(redis_inst, channel, message){
    if(typeof redis_channel[channel] === 'function'){
        redis_channel[channel](message);
    }else{
        if(message && (typeof message == 'string')){
            if(message.indexOf('__EX_') === 0){
                var key = message.replace('__EX_', '');
                var iType = key.substring(0, key.indexOf('_'));
                key = key.replace(iType+'_', '');
                var inst = _.getRedis(iType);
                inst.get(key, function(err, result){
                    if(result && typeof redis_type[iType].Func == 'function'){
                        redis_type[iType].Func(key, result);
                    }
                });
            }
        }
    }
};

_.stopSlave = function(redis_inst){
    redis_inst.slaveof("NO", "ONE", function(err, res){
        if(err){
            console.error("redis %s:%d fail to stop slaveof no one", 
                         redis_inst.connectionOption.host,
                         redis_inst.connectionOption.port);
            console.error(err);
        }else{
            console.log("success slaveof no one");
        }
    });
};

_.onEnd = function(err, redis_inst){
    // TCP Connection disconnected
    console.error("REDIS: connection to redis is disconnected!!!");
    //console.error("err=", err);
    //console.error("redis_inst=", redis_inst);
};

_.onError = function(err, redis_inst){
    var iLength = redis_config.length;
    console.error("Redis Error occupied, have [%d] configuration(s) err %s",iLength, JSON.stringify(err));

    var szHost, iPort, szPwd;
    var iIdx = 0, szTxt = '';
    var network = require(path.join(global.rootPath, 'util/network'));
    for(var i=0; i!=iLength; ++i){
        if(redis_inst.connectionOption.host == redis_config[i].szRedisIP &&
           redis_inst.connectionOption.port == redis_config[i].szRedisPort){
            iIdx = i;
            szHost = redis_config[i].szSlaveIP;
            iPort = redis_config[i].szSlavePort;
            szPwd = redis_config[i].szSlavePwd;
            console.error("switch to slave redis[%d]->[%s:%d]", i, szHost, iPort);
            break;
        }
    }
    if(szHost && iPort && szPwd){
        if(redis_array[iIdx].connectionOption.host != szHost || 
           redis_array[iIdx].connectionOption.port != iPort &&
           redis_inst.attempts > 1){
            //启动连接到slave，这个地方有一点风险，只给主redis 1 次重试的机会
            redis_array[iIdx] = _.connect(iPort, szHost, szPwd);
            _.stopSlave(redis_array[iIdx]);
            if(iIdx === 0){
                console.error("redis re-sub, ori redis_sub=", redis_sub);
                redis_sub = _.connect(iPort, szHost, szPwd);
                redis_sub.on('message', function(channel, msg){
                    _.onMessage(redis_sub, channel, msg);
                });
            }
            szTxt = util.format('严重故障(%s)：REDIS %s:%s 链接失败（挂了），链接到配置的从库 %s:%s',
                      network.get_local_ip(),
                      redis_inst.connectionOption.host, redis_inst.connectionOption.port, szHost, iPort);
            console.error(szTxt);
        }else{
            //走到这里是主redis还在不停的重试
            console.error('!!! redis %s:%s error !!! attempt:%s', 
                      redis_inst.connectionOption.host, redis_inst.connectionOption.port,
                      redis_inst.attempts);
        }
    }else{
        //要命了，没有从库了
        szTxt = util.format('致命故障(%s)：REDIS %s:%s 链接失败（挂了），无配置从库',
            network.get_local_ip(),
            redis_inst.connectionOption.host, redis_inst.connectionOption.port);
        console.error(szTxt);
    }
};

var gCurNum = 0; //循环计数
_.send = function(name, param, aLiveNum){
    var szName = name;
    if(aLiveNum){
        var iRealNum = aLiveNum[(gCurNum++) % aLiveNum.length];
        szName = name + iRealNum;
    }
    //console.log('send real channel num is %s%d', name, iRealNum);
    if(typeof param == 'object'){
        redis_array[0].publish(szName, JSON.stringify(param));
    }else{
        redis_array[0].publish(szName, param);
    }
};

var sendWarningcb = function(err, result){
    if(err || !result) console.error(err);
};

_.onConnect = function(redis_inst){
    console.log("redis %s:%d connect success", redis_inst.connectionOption.host,
               redis_inst.connectionOption.port);
};

_.check = function(key){
    if(key === null || (typeof key == 'undefined')){
        return true;
    }
    if(typeof key == 'number' && isNaN(key)) return true;
    if(typeof key == 'string' && key.length === 0) return true;
    return false;
};

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

/*
 *  每种类型的timer仅需要注册一次，同种类型的Timer注册一个回调函数
 *  函数返回一个句柄，用于标识，在启动的时候，需要注册的模块先行注册
 */
redis_mgr.regTimer = function(timer_enum, func){
    if(typeof timer_enum !== 'number' || typeof timer_enum === 'undefined'){
        console.error('%s register timer fail', debugTool.getCaller());
        console.error('add redis timer at define/redis.js');
        return null;
    }
    console.log("%s register a timer class", debugTool.getCaller());
    redis_timer[timer_enum] = func;
    return timer_enum;
};

/*
 * Func:基于redis的Timer,每次注册只能执行一次,可以落地，保证一定的容灾性
 * param:func 回调函数
 *       timeT 时间、秒
 *       obj 回掉函数的参数,可以传一个null
 */
redis_mgr.addTimer = function(timeT, obj, iType){
    if(iType === null){
        console.error("add a null handle timer");
        return;
    }
    var szUUID = uuid.v1();
    var iNow = Math.floor(new Date().getTime() / 1000);
    var param = {i:iType,o:obj,u:szUUID,n:iNow,t:timeT};
    redis_mgr.sadd2(redis_define.enum.TIMER, szTimerSetKey, JSON.stringify(param));
    setTimeout(timerCall, timeT * 1000, param);
};

//cb:function(info) info 为数组，如果没有Timers，返回[] 如果发生错误，返回null
redis_mgr.getTimers = function(cb){
    redis_mgr.smembers2(redis_define.enum.TIMER, szTimerSetKey, function(err, info){
        if(info && info.length > 0){
            cb(info);
        }else{
            if(err){
                console.error("fail to get all timers %s", err);
                cb(null);
            }else{
                cb([]);
            }
        }
    });
};

function timerCall(obj){
    redis_mgr.srem2(redis_define.enum.TIMER, szTimerSetKey, JSON.stringify(obj));
    redis_timer[obj.i](obj.o);
}

/*
 * Func: function(key, value)
 * redis 过期回调
 * example:
 * redis_mgr.regExpire(redis_define.enum.VERIFY_CODE, function(key, value){
 *   console.error(key);
 *   console.error(value);
 * });
 */
redis_mgr.regExpire = function(iType, Func){
    if(typeof redis_type[iType] === 'undefined'){
        console.error('register redis callback function fail of type %d', iType);
        return;
    }
    redis_type[iType].Func = Func;
};

/*
 * regChannelFile & sendFile 配对使用
 * Func: function(szTmpFileName) szTmpFileName 位于/tmp/临时文件名
 */
redis_mgr.regChannelFile = function(iType, Func){
    redis_mgr.regChannel(iType, function(msg){
        var buf = new Buffer(msg, 'binary');
        var szName = '/tmp/'+uuid.v1();
        console.error('open file:' + szName);
        fs.open(szName, 'w', function(status, fd){
            if(fd > 0){
                var iNum = fs.writeSync(fd, buf, 0, buf.length);
                if(iNum != buf.length){
                    console.error('fail to write file %s', szName);
                    Func(null);
                }else{
                    Func(szName);
                }
            }else{
                Func(null);
            }
        });
    });
};

redis_mgr.sendFile = function(iType, szFileName){
    async.waterfall([
        function(callback){
            fs.stat(szFileName, function(err, stat){
                if(err){
                    callback(err);
                }else{
                    callback(null, stat.size);
                }
            });
        },function(iSize, callback){
            var buf = new Buffer(iSize);
            fs.open(szFileName, 'r', function(status, fd){
                fs.read(fd, buf, 0, iSize, 0, function(err, num){
                    var szBuf = buf.toString('binary');
                    redis_mgr.send(iType, szBuf);
                    callback(null);
                });
            });
        }
    ],function(err){
    });
};

/*
 * regChannel 和 send需要配对使用
 * Func: function(message)
 */
redis_mgr.regChannel = function(iType, Func){
    if(isNaN(parseInt(iType))){
        console.error('regChannel fail type %s', iType);
        return;
    }
    var name = redis_channel_name[iType];
    var num = redis_channel_num[iType];
    if(num > 0){
        redis_array[0].pubsub('CHANNELS', name+'?', function(err, res){
            var iNum = res.length; //当前活着的channel个数, 这里不能简单的直接这个数字拿来当前num，前面可能有空
                                //创建的时候要确保补齐死掉的,不然num会冲突
            if(err){
                console.error('regChannel fail to pubsub channels %s', name);
                console.error(err);
            }else{
                var iLength = res.length;
                for(var i=0; i!=iLength; ++i){
                    if(res.indexOf(name+i) == -1){
                        iNum = i;
                        console.log('find one empty channel name num is %d', iNum);
                        break;
                    }
                }
                var szName = name + iNum;
                console.error('subscribe channel %s', szName);
                redis_sub.subscribe(szName);
                redis_channel[szName] = Func;
            }
        });
    }else{
        redis_sub.subscribe(name);
        redis_channel[name] = Func;
    }
};

var dtLastTime = 0; //上次检查live时间
var gLiveNum = []; //上次检查live的时候，存活的channel的编号
redis_mgr.send = function(iType, param){
    if(isNaN(parseInt(iType))){
        console.error('send fail type %s', iType);
        return;
    }
    var name = redis_channel_name[iType];
    var num = redis_channel_num[iType];
    if(dtLastTime === 0 && num >= 0){
        for(var i=0; i!=num; ++i){
            gLiveNum[i] = i;
        }
    }
    if(num > 0){ //这个channel配置多个接收者
        var iNow = Math.floor(new Date().getTime() / 1000);
        if(iNow - dtLastTime > 10){ //每十秒检查一下对端是否存活
            console.log('begin to check channel %s', name);
            dtLastTime = iNow;
            redis_array[0].pubsub('CHANNELS', name+'?', function(err, res){
                if(!err && res){
                    var iNum = res.length;
                    if(iNum != num){ //出事了, 现在要找出来谁死了
                        console.error("%s live channel count(%d) is not equal config(%d)", name, iNum, num);
                        if(iNum > num){ //可能是配置配错了
                            console.error("%s config count(%d) is small than live(%d), use live count", name, num, iNum);
                            num = iNum;
                        }
                        gLiveNum = [];
                        var iLiveCnt = 0;
                        var count = 0;
                        async.whilst(
                            function() {return count < num; },
                            function(callback){
                                _.checkAlive(name + count, function(bAlive){
                                    if(bAlive){
                                        gLiveNum[iLiveCnt] = count;
                                        iLiveCnt ++;
                                    }
                                    count ++;
                                    callback();
                                });
                            },function(err){
                                console.error('%s, now live channel is %s', name, gLiveNum.join(','));
                                _.send(name, param, gLiveNum);
                            }
                        );
                    }else{
                        //console.error("%s fail to check redis channel %s", name, JSON.stringify(err));
                        _.send(name, param, gLiveNum);
                    }
                }else{ //可能对端还没有一个启动, 这个时候只能假设所有人都活着
                    _.send(name, param, gLiveNum);
                }
            });
        }else{
            _.send(name, param, gLiveNum);
        }
    }else{
        _.send(name, param, null);
    }
};

//传已经get_name处理过的key
//redis 过期处理并不准确
redis_mgr.expire2 = function(iType, key){
    if(redis_type[iType].TIMEOUT){
        var inst = _.getRedis(iType);
        inst.expire(key, redis_type[iType].TIMEOUT);   
        if(redis_type[iType].Func && typeof redis_type[iType].Func == 'function'){
            inst.setex('__EX_'+iType+'_'+key, redis_type[iType].TIMEOUT-10, 1);
        }
    }
};

redis_mgr.init = function(port){
    curPort = port;
    szTimerSetKey = 'REDIS_TIMER_' + curPort;
    var opt = {encoding:'utf8'};
    var szFile = fs.readFileSync(path.join(global.rootPath, 'config/redis.json'), opt);
    if(szFile && szFile.length > 0){
        redis_config = JSON.parse(szFile);
        var idx = 0;
        async.each(redis_config, function(config, cb){
            redis_array[idx] = _.connect(config.szRedisPort, config.szRedisIP, config.szPwd);
            redis_array[idx].get('REDIS_MY', function(err, value){
                if(value === null || typeof value == 'undefined'){
                    redis_array[idx].set('REDIS_MY', __dirname);
                }else{
                    if(value != __dirname){
                        console.log("======================================");
                        console.log('redis %s compare to now %s', value, __dirname);
                        console.error("!!!!!!!!CURRENT REDIS PORT %d!!!!!!!!", config.szRedisPort);
                        console.error("!!!!!!!!PLEASE USE YOUR REDIS!!!!!!!!");
                        console.log("=============== channels ===================");
                        assert(false);
                    }
                }
                cb();
            });
        }, function(err){
        });
        redis_sub = _.connect(redis_config[0].szRedisPort, redis_config[0].szRedisIP, redis_config[0].szPwd);
        redis_sub.on('message', function(channel,message){
            _.onMessage(redis_sub, channel, message);
        });
    }else{
        console.error("fail to load redis config file %s", 'config/redis.json');
    }
    var length = redis_define.type.length;    
    redis_define.type.sort(function(a, b){
        return a.iType - b.iType;
    });
    console.log("redis type init");
    if(console.traceOptions){
        console.traceOptions.always = false;
    }
    console.log('---------------------------------------------------------------------------------------------------------------------------------------');
    console.log('|           name           | ID |  TIMEOUT  ||           name           | ID |  TIMEOUT  ||           name           | ID |  TIMEOUT  |');
    console.log('---------------------------------------------------------------------------------------------------------------------------------------');
    var iLast = 0;
    for(var i=0; i!=length; ++i){
        var iType = redis_define.type[i].iType;
        redis_type[iType] = {};
        var type = redis_define.type[i];
        redis_type[iType].Pre = type.szPre;
        redis_type[iType].TIMEOUT = type.TIMEOUT;
        redis_type[iType].FRESH = type.FRESH;
        redis_type[iType].iIndex = type.iIndex;
        if(typeof type.TIMEOUT != 'undefined'){
            if(typeof type.FRESH == 'undefined'){
                redis_type[iType].FRESH = 1;
            }
        }
        if(i % 3 === 0 && i > 0){
            iLast = i;
            console.log('|%s|%s|%s||%s|%s|%s||%s|%s|%s|',
            S(redis_define.type[i-3].szPre).pad(26).s, S(''+redis_define.type[i-3].iType).pad(4).s, S(''+redis_define.type[i-3].TIMEOUT).pad(11).s,
            S(redis_define.type[i-2].szPre).pad(26).s, S(''+redis_define.type[i-2].iType).pad(4).s, S(''+redis_define.type[i-2].TIMEOUT).pad(11).s,
            S(redis_define.type[i-1].szPre).pad(26).s, S(''+redis_define.type[i-1].iType).pad(4).s, S(''+redis_define.type[i-1].TIMEOUT).pad(11).s
            );
        }
    }
    var sz = '';
    for(var j=0; j!=3; ++j){
        if(redis_define.type[iLast+j]){
            sz += "|" + S(redis_define.type[iLast+j].szPre).pad(26).s+"|" + 
                S(''+redis_define.type[iLast+j].iType).pad(4).s+"|" +
                S(''+redis_define.type[iLast+j].TIMEOUT).pad(11).s + "|";
        }else{
            sz += "|" +S('').pad(26).s + "|"+S('').pad(4).s+"|"+S('').pad(11).s+"|";
        }
    }
    console.log(sz);
    console.log('---------------------------------------------------------------------------------------------------------------------------------------');
    if(console.traceOptions){
        console.traceOptions.always = true;
    }
    console.log("=============== channels start ==================");
    for(var name in redis_define.enum){
        redis_channel_name[redis_define.enum[name]] = name;
        redis_channel_num[redis_define.enum[name]] = redis_define.channel_num_define[name];
        console.log(name);
    }
    console.log("=============== channels end ==================");
    redis_mgr.getTimers(function(info){
        if(info){
            console.log('RESTART TIMER COUNT IS %d', info.length);
            async.each(info, function(timer, callback){
                var iNow = Math.floor(new Date().getTime() / 1000);
                var obj = JSON.parse(timer);
                redis_mgr.srem2(redis_define.enum.TIMER, szTimerSetKey, JSON.stringify(obj));
                var newT = obj.n + obj.t - iNow;
                obj.t = newT;
                obj.n = iNow;
                console.log('timer from redis %d', newT);
                if(newT > 0){
                    redis_mgr.addTimer(obj.t, obj.o, obj.i);
                }else{
                    setTimeout(timerCall, 1000, obj);
                }
                callback();
            }, function(err){
            });
        }
    });
};

redis_mgr.setnx2 = function(iType, key, value, cb){
    if(_.check(key)){
        console.error("redis setnx recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    var inst = _.getRedis(iType);
    inst.setnx(szKey, JSON.stringify(value), cb);
    redis_mgr.expire2(iType, szKey);
};

redis_mgr.set2 = function(iType, key, value, cb){
    if(_.check(key)){
        console.error("redis set2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).set(szKey, JSON.stringify(value), cb);
    redis_mgr.expire2(iType, szKey);
};

redis_mgr.hset = function(iType, key, field, value, cb){
    if(_.check(key)){
        console.error("redis hset recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).hset(szKey, field, JSON.stringify(value), cb);
    redis_mgr.expire2(iType, szKey);
};

redis_mgr.hget = function(iType, key, field, cb){
    if(_.check(key)){
        console.error("redis hget recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).hget(szKey, field, function(err, res){
        if(redis_type[iType].FRESH == 1){
            redis_mgr.expire2(iType, szKey);
        }
        cb(err, res);
    });
};

redis_mgr.hgetall = function(iType, key, cb){
    if(_.check(key)){
        console.error("redis hget recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).hgetall(szKey, function(err, res){
        if(redis_type[iType].FRESH == 1){
            redis_mgr.expire2(iType, szKey);
        }
        cb(err, res);
    });
};

redis_mgr.del2 = function(iType, key, cb){
    if(_.check(key)){
        console.error("redis del2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).del(szKey, cb);
};

//批量删除一种type下的所有key
redis_mgr.mdel2 = function(iType) {
    var szKey = _.get_name(iType,'*');
    var inst = _.getRedis(iType);
    inst.keys(szKey,function(err,rows) {
        if(!err){
            rows.forEach(function(key){
                inst.del(key);
            });
        }
    });
};

redis_mgr.get2 = function(iType, key, cb){
    var szKey = _.get_name(iType, key);
    if(_.check(key)){
        console.error("redis get2 recv null key:%s type %s", key, szKey);
        assert(false);
        return;
    }
    var inst = _.getRedis(iType);
    inst.get(szKey, function(err, res){
        if(redis_type[iType].FRESH == 1){
            redis_mgr.expire2(iType, szKey);
        }
        if(cb){
            if(res){
                cb(err, JSON.parse(res));
            }else{
                cb(err, null);
            }
        }
    });
};

redis_mgr.atomic_incr="local v = redis.call('INCR', ARGV[1]) if v == 1 then redis.call('EXPIRE', ARGV[1], ARGV[2]) end return v";
redis_mgr.atomic_decr="local v = redis.call('DECR', ARGV[1]) if v == -1 then redis.call('EXPIRE', ARGV[1], ARGV[2]) end return v";

redis_mgr.incr2 = function(iType, key, cb){
    if(_.check(key)){
        console.error("redis incr2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    var inst = _.getRedis(iType);
    if(redis_type[iType].TIMEOUT){
        /*jshint ignore:start*/
        inst.eval(redis_mgr.atomic_incr, 0, szKey, redis_type[iType].TIMEOUT, function(err, res){
            cb(err, JSON.parse(res));
        });
        /*jshint ignore:end*/
    }else{
        inst.incr(szKey, function(err, res){
            cb(err, JSON.parse(res));
        });
    }
};

redis_mgr.incrby = function(iType, key, iNum, cb){
    if(_.check(key)){
        console.error("redis incrby recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    var inst = _.getRedis(iType);
    if(redis_type[iType].TIMEOUT){
        inst.set(szKey, 0, 'EX', redis_type[iType].TIMEOUT, 'NX', function(err, res){
            if(err){
                cb(err, 0);
            }else{
                inst.incrby(szKey, iNum, function(err, res){
                    cb(err, JSON.parse(res));
                });
            }
        });
    }else{
        inst.incrby(szKey, iNum, function(err, res){
            cb(err, JSON.parse(res));
        });
    }
};

redis_mgr.decr2 = function(iType, key, cb){
    if(_.check(key)){
        console.error("redis decr2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    var inst = _.getRedis(iType);
    if(redis_type[iType].TIMEOUT){
        /*jshint ignore:start*/
        inst.eval(redis_mgr.atomic_decr, 0, szKey, redis_type[iType].TIMEOUT, function(err, res){
            cb(err, JSON.parse(res));
        });
        /*jshint ignore:end*/
    }else{
        inst.decr(szKey, function(err, res){
            cb(err, JSON.parse(res));
        });
    }
};

redis_mgr.publish = function(szChannel, obj){
    return redis_array[0].publish(szChannel, JSON.stringify(obj));
};

redis_mgr.mget = function(iType, array, cb){
    var newArray = [];
    for(var name in array){
        var newName = _.get_name(iType, array[name]);
        redis_mgr.expire2(iType, newName);
        newArray.push(newName); 
    }
    _.getRedis(iType).mget(newArray, function(err, res){
        cb(err, res);
    });
};

redis_mgr.rpush2 = function(iType, key, value, cb){
    if(_.check(key)){
        console.error("redis rpush2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    return _.getRedis(iType).rpush(szKey, value, cb);
};

redis_mgr.zrevrange2 = function(iType, key, srank, erank, cb){
    if(_.check(key)){
        console.error("redis zrevrange2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).zrevrange(szKey, srank, erank, 'withscores', cb);
};

redis_mgr.sadd2 = function(iType, key, value, cb){
    if(_.check(key)){
        console.error("redis sadd2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).sadd(szKey, value, cb);
    redis_mgr.expire2(iType, szKey);
};

redis_mgr.srem2 = function(iType, key, value, cb){
    if(_.check(key)){
        console.error("redis srem2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    return _.getRedis(iType).srem(szKey, value, cb);
};

redis_mgr.smembers2 = function(iType, key, cb){
    if(_.check(key)){
        console.error("redis smembers2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).smembers(szKey, cb);
};

redis_mgr.sismember2 = function(iType, key, value, cb){
    if(_.check(key)){
        console.error("redis sismember recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).sismember(szKey, value, cb);
};

redis_mgr.zadd2 = function(iType, key, score, member, cb){
    if(_.check(key)){
        console.error("redis zadd2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).zadd(szKey, score, member, cb);
};

redis_mgr.zincrby2 = function(iType, key, score, member, cb){
    if(_.check(key)){
        console.error("redis zincrby2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).zincrby(szKey, score, member, cb);
};

redis_mgr.zscore2 = function(iType, key, member, cb){
    if(_.check(key)){
        console.error("redis zscore2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).zscore(szKey, member, cb);
};

redis_mgr.zrevrank2 = function(iType, key, member, cb){
    if(_.check(key)){
        console.error("redis zrevrank2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).zrevrank(szKey, member, cb);
};


redis_mgr.zremrangebyrank2 = function(iType, key, start, end, cb){
    if(_.check(key)){
        console.error("redis set2 recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    _.getRedis(iType).zremrangebyrank(szKey, start, end, cb);
};

redis_mgr.lock = function(key, iTTL, cb){
    var szKey = _.get_name(redis_define.enum.CONFIG, key);
    var inst = _.getRedis(redis_define.enum.CONFIG);
    inst.set(szKey, '1', 'NX', 'PX', iTTL, function(err, result){
        cb(err, result);
    });
};

redis_mgr.lpop2 = function(iType, key, cb){
    if(_.check(key)){
        console.error("redis lpop recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    var inst = _.getRedis(redis_define.enum.CONFIG);
    inst.lpop(szKey, cb);
};

redis_mgr.lpush2 = function(iType, key, value, cb){
    if(_.check(key)){
        console.error("redis lpush recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    var inst = _.getRedis(redis_define.enum.CONFIG);
    inst.lpush(szKey, value, cb);
};

redis_mgr.llen = function(iType, key, cb){
    if(_.check(key)){
        console.error("redis llen recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    var inst = _.getRedis(redis_define.enum.CONFIG);
    inst.llen(szKey, cb);
};

redis_mgr.lrange = function(iType, key, start, stop, cb){
    if(_.check(key)){
        console.error("redis lrange recv null key:%s", key);
        assert(false);
        return;
    }
    var szKey = _.get_name(iType, key);
    var inst = _.getRedis(redis_define.enum.CONFIG);
    inst.lrange(szKey, start, stop, cb);
};

module.exports = redis_mgr;
