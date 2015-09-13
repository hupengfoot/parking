var express = require('express');
var router = express.Router();
var path = require('path');
var searchBiz = require(path.join(global.rootPath, 'interfaceBiz/searchBiz'));
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var redis_mgr = require(path.join(global.rootPath, 'redis/redis_mgr'));

router.get('/', function(req, res){
    var params = req.query;
    searchBiz.search(params.key.trim(), parseInt(params.iPageNum), parseInt(params.iType), 
                     parseInt(params.iTime), parseInt(params.tStart), parseInt(params.tEnd), 
                     parseInt(params.iSort), function(err, result){
        msg.wrapper(err,result,res);
    });
});

router.get('/suggest', function(req, res){
    var params = req.query;
    searchBiz.suggest(params.key, function(err, result){
        msg.wrapper(err,result,res);
    });
});

var iPreCmd = Date.parse(new Date()) / 1000;

router.get('/addword', function(req, res){
    var iNow = Date.parse(new Date()) / 1000;
    if(iNow - iPreCmd < 60){
        msg.wrapper(msg.code.ERR_SPHINX_TIME_LIMIT, null, res);
    }else{
        iPreCmd = iNow;
        var params = req.query;
        redis_mgr.send(redis_channel_enum.SEARCH_INDEX,{iType:2, word:params.word});
        msg.wrapper(null, null, res);
    }
});

router.get('/fresh', function(req, res){
    var iNow = Date.parse(new Date()) / 1000;
    if(iNow - iPreCmd < 60){
        msg.wrapper(msg.code.ERR_SPHINX_TIME_LIMIT, null, res);
    }else{
        iPreCmd = iNow;
        redis_mgr.send(redis_channel_enum.SEARCH_INDEX,{iType:1});
        msg.wrapper(null, null, res);
    }
});

router.get('/getword', function(req, res){
    var szVal = searchBiz.getWord();
    var words = [];
    var params = req.query;
    if(params.iEnd > szVal.length){
        params.iEnd = szVal.length;
    }
    for(var i=params.iStart; i!=params.iEnd; ++i){
        words.push(szVal[i]);
    }
    msg.wrapper(null, {res:words, total:szVal.length}, res);
});

module.exports = router;
