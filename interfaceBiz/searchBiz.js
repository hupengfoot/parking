/*
 * 自动完成 & 错误修正 * http://sphinxsearch.com/blog/2013/05/21/simple-autocomplete-and-correction-suggestion/
 *
 * 中文说明 * http://www.coreseek.cn/docs/coreseek_4.1-sphinx_2.0.1-beta.html#expr-func-interval
 *
 * 搜狗词库：http://pinyin.sogou.com/dict/cate/
 */
var searchBiz = {};
var limestone = require ("limestone").SphinxClient();
var path = require('path');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/dbparking'));
var util = require('util');
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;
var redis_mgr = require(path.join(global.rootPath, 'redis/redis_mgr'));
var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs');
var moment = require('moment');
var mysql = require('mysql'); 
var networkTool = require(path.join(global.rootPath, 'util/network'));
var eventDefine = require(path.join(global.rootPath, 'define/event'));
var eventMgr = require(path.join(global.rootPath, 'util/eventMgr'));
var global_config = require(path.join(global.rootPath, "config/mysql"));
var moment = require('moment');

var sphinxQL = mysql.createPool({
    host:'127.0.0.1',
    port:'3909',
    connectionLimit:'3',
    timezone:'Asia/Hong Kong'
});

var sphinxPort = 9312;
var iPageSize = 10;
var iSuggestSize = 20;
var iConnection = false;
var encoding = '';

var _ = {};
_.getContext = function(matches, cb){
    var tableIndex = [];
    var orderIndex = [];
    if(!matches || matches.length === 0){
        cb(null, []);
        return;
    }
    for(var i=0; i!=matches.length; ++i){
        var id = matches[i].attrs.iproductid;
        if(typeof tableIndex[id] == 'undefined'){
            tableIndex[id] = [];
        }
        tableIndex[id].push(matches[i].doc);
        orderIndex.push(matches[i].doc);
    }
    var szSqls = [];
    for(var name in tableIndex){
        szSqls.push(util.format("select * from tbArticle_%d where iArticleID in (%s)", name%128, 
                            tableIndex[name].join(',')));
    }
    var szSql = szSqls.join(' union ');
    var ids = orderIndex.join(',');
    sqlPool.excute(1800, [szSql, ids, ids], function(err, rows){
        cb(err, rows);
    });
};

var iExcerptType = {
    DB:1,
    AUTO:2
};

_.buildExcerpts = function(result, words, param, iType, cb){
    if(!result || result.length === 0){
        cb(null, []);
        return;
    }
    var szIndex = '';
    var szDoc = [];
    if(iType == iExcerptType.DB){
        szIndex = 'mysql';
        for(var i=0; i!=result.length; ++i){
            if(result[i].iType === 0 || result[i].iType == 4){
                szDoc.push(result[i].szSummary + result[i].szDetails);
            }else{
                szDoc.push(result[i].szDetails);
            }
        }
        for(i=0; i!=result.length; ++i){
            szDoc.push(result[i].szTitle);
        }
    }else if(iType == iExcerptType.AUTO){
        szIndex = 'auto';
        for(var j=0; j!=result.length; ++j){
            szDoc.push(result[j].attrs.sztitle);
        }
        /*
        for(j=0; j!=result.length; ++j){
            szDoc.push(result[j].attrs.szsummary);
        }
        */
    }else{
        console.error("excerpts wrong type %d", iType);
    }
    limestone.build_excerpts(szDoc, szIndex, words, param, function(err, result){
        cb(err, result);
    });
};

_.connect = function(callback){
    console.error('try to connect!!!');
    limestone.connect(sphinxPort, true, function(err){
	console.error('*************************************');
	console.error(err);
	console.error('*************************************');
        if(err){
            console.error("fail to connect sphinx server port %d err %s", sphinxPort, JSON.stringify(err));
            if(callback){
                callback(msg.code.ERR_CONNECT_SPHINX);
            }
        }else{
            if(callback){
                callback();
            }
        }
    });
};

searchBiz.suggest = function(szWords, cb){
    szWords = szWords.trim();
    async.waterfall([
        function(callback){
            iConnection = limestone.is_connect(); 
            if(!iConnection){
                _.connect(callback);
            }else{
                callback();
            }
        },function(callback){
            iConnection = true;
            var objQuery = {};
            objQuery.query = szWords + "*";
            objQuery.limit = iSuggestSize;
            objQuery.indexes = 'mysql';
            objQuery.mode = limestone.Sphinx.searchMode.EXTENDED2;
            objQuery.ranker = limestone.Sphinx.rankingMode.SPH04;
            objQuery.sort = limestone.Sphinx.sortMode.EXTENDED;
            objQuery.sortby = "@weight DESC";
            objQuery.groupby = 'sztitle';
            objQuery.groupfunc = limestone.Sphinx.groupFunc.ATTR;
            objQuery.groupsort = "@count desc";
            //objQuery.filters = [];
            //objQuery.filters.push({attr:'istatus',type:limestone.Sphinx.filterTypes.VALUES,values:[0]}); 
            objQuery.fieldweights = {};
            objQuery.fieldweights.sztitle = 100;
            objQuery.fieldweights.szsummary = 1;
	    console.error('try to query!!!');
            limestone.query(objQuery,function(err, answer){
		console.error('***************************');
		console.error(err);
		console.error('***************************');
                if(err){
                    console.error(err);
                    callback(msg.code.ERR_CONNECT_SPHINX);
                }else{
                    callback(null, answer);
                }
            });
        },function(answer, callback){
            var opt = {around:2,limit:32,chunk_separator:''};
            _.buildExcerpts(answer.matches, szWords, opt, iExcerptType.AUTO, function(err, rows){
                if(err){
                    console.error(err);
                    callback(msg.code.ERR_CONNECT_SPHINX);
                }else{
                    var total = {answer:answer, rows:rows};
                    callback(null, total);
                }
            });
        }
    ],function(err, result){
        if(err){
            cb(err);
        }else{
            var list = {};
            if(result.rows && result.rows.docs){
                var iCount = 0;
                for(var i=0; i!=result.rows.docs.length; ++i){
                    if(result.rows.docs[i].indexOf("<b>") > -1){
                        if(typeof list[result.rows.docs[i]] == 'undefined'){
                            list[result.rows.docs[i]]=1;
                            iCount++;
                        }
                    }
                    if(iCount > 5){
                        break;
                    }
                }
            }
            var listRes = [];
            for(var keys in list){
                listRes.push(keys);
            }
            cb(null, listRes);
        }
    });
};

searchBiz.searchType={
    ALL:0,
    TJ:1,//推荐阅读
    CP:2,//测评
    RJ:3,//日记
    TL:4, //讨论话题
    GF:5 //官方动态
};

searchBiz.searchTime={
    A:0,//全部
    S:1 //自定义 根据时间过滤
};

_.addFilter = function(iType, iTime, tStart, tEnd){
    var filters= [];
    filters.push({attr:'istatus',type:limestone.Sphinx.filterTypes.VALUES,values:[0]}); 
    switch(iType){
        case searchBiz.searchType.ALL:
        break;
        case searchBiz.searchType.TJ:
            filters.push({attr:'itype',type:limestone.Sphinx.filterTypes.VALUES,values:[2,3,4]});
        break;
        case searchBiz.searchType.CP:
            filters.push({attr:'itype',type:limestone.Sphinx.filterTypes.VALUES,values:[6]});
        break;
        case searchBiz.searchType.RJ:
            filters.push({attr:'itype',type:limestone.Sphinx.filterTypes.VALUES,values:[5]});
        break;
        case searchBiz.searchType.TL:
            filters.push({attr:'itype',type:limestone.Sphinx.filterTypes.VALUES,values:[1]});
        break;
        case searchBiz.searchType.GF:
            filters.push({attr:'itype',type:limestone.Sphinx.filterTypes.VALUES,values:[0]});
        break;
    }
    if(iTime == searchBiz.searchTime.S){
        var iStart = moment(tStart, 'YYYYMMDDHHmmss').unix();
        var iEnd = moment(tEnd, 'YYYYMMDDHHmmss').unix();
        filters.push({attr:'date_added',type:limestone.Sphinx.filterTypes.RANGE,min:iStart,max:iEnd});
    }
    return filters;
};

searchBiz.searchSort = {
    DEFAULT:1,
    TIME:2
};
/*
 * iType:searchType
 *
 */
searchBiz.search = function(szWords, iPageNum, iType, iTime, tStart, tEnd, iSort, cb){
    console.log("begin to search key:[%s] iPageNum:[%d] iType:[%d] iTime[%d] tStart[%d] tEnd[%d] iSort[%d]",
               szWords, iPageNum, iType, iTime, tStart, tEnd, iSort);
    _.storeKey(szWords);          
    async.waterfall([
        function(callback){
            iConnection = limestone.is_connect(); 
            if(!iConnection){
                _.connect(callback);
            }else{
                callback();
            }
        },function(callback){
            iConnection = true;
            var objQuery = {};
            objQuery.query = szWords;
            objQuery.limit = iPageSize;
            objQuery.offset = (iPageNum) * iPageSize;
            objQuery.indexes = 'mysql';
            objQuery.mode = limestone.Sphinx.searchMode.ANY;
            objQuery.filters =  _.addFilter(iType, iTime, tStart, tEnd);
            if(iSort == searchBiz.searchSort.TIME){
                objQuery.sort = limestone.Sphinx.sortMode.ATTR_DESC;
                objQuery.sortby = 'date_added';
            }
            objQuery.fieldweights = {};
            objQuery.fieldweights.sztitle = 100;
            objQuery.fieldweights.szsummary = 10;
            objQuery.fieldweights.szdetail = 1;
	    console.error('try to query!!!!');
            limestone.query(objQuery, function(err, answer){
                if(err){
                    if(err == limestone.Sphinx.error.DISCONNECT){
                        _.connect();
                    }
                    console.error(err);
                    callback(msg.code.ERR_CONNECT_SPHINX);
                }else{
                    callback(null, answer);
                }
            });
        },function(answer, callback){
            _.getContext(answer.matches, function(err, rows){
                if(err){
                    console.error(err);
                    callback(msg.code.ERR_CONNECT_SPHINX);
                }else{
                    var total = {answer:answer, rows:rows};
                    callback(null, total);
                }
            });
        },function(total, callback){
            _.buildExcerpts(total.rows, szWords, {}, iExcerptType.DB, function(err, rows){
                if(err){
                    console.error(err);
                    callback(msg.code.ERR_CONNECT_SPHINX);
                }else{
                    total.excerpt = rows;
                    callback(null, total);
                }
            });
        }
    ],function(err, result){
        if(err){
            console.error('search error %s', JSON.stringify(err));
            cb(err);
        }else{
            var list = {};
            list.total = result.answer.total;
            list.res = [];
            list.szKeys = result.answer.words;
            var iSize = result.rows.length;
            for(var i=0; i!=iSize; ++i){
                list.res.push({
                    iProductID : result.rows[i].iProductID,//result.answer.matches[i].attrs.iproductid,
                    iType      : result.rows[i].iType,//result.answer.matches[i].attrs.itype,
                    iArticleID : result.rows[i].iArticleID,//result.answer.matches[i].doc,
                    iClassID   : result.rows[i].iClassID,//result.answer.matches[i].attrs.iclassid,
                    iStatus    : result.rows[i].iStatus,//result.answer.matches[i].attrs.istatus,
                    szDetail   : result.excerpt.docs[i],
                    szDate     : result.rows[i].dtTime,
                });
            }
            for(i=iSize; i!=iSize*2; ++i){
                list.res[i-iSize].szTitle = result.excerpt.docs[i];
            }
            console.log("begin to search key:[%s] iPageNum:[%d] iType:[%d] iTime[%d] tStart[%d] tEnd[%d] iSort[%d]",
               szWords, iPageNum, iType, iTime, tStart, tEnd, iSort);
            var searchRes = {};
            searchRes.key = szWords;
            searchRes.iPageNum = iPageNum;
            searchRes.iType = iType;
            searchRes.iTime = iTime;
            searchRes.tStart = tStart;
            searchRes.tEnd = tEnd;
            searchRes.iSort = iSort;
            searchRes.szKeys = list.szKeys; 
            cb(null, list);
        }
    });
};

_.exec = function(szCmd, cb){
    console.time("exec cmd " + szCmd);
    var p = exec(szCmd, function(err, stdout, stderr){
        if(stdout)
            console.log('stdout: ' + stdout);
        if(stderr)
            console.log('stderr: ' + stderr);
        if (err !== null) {
            console.log('exec error: ' + err);
        }
        console.timeEnd("exec cmd "+szCmd);
        if(cb){ cb(); }
    });
};

_.checkPID = function(cb){
    var szTmp = "./coreseek/searchd_mysql.pid";
    if(!fs.existsSync(szTmp)){
        cb(false);
        return;
    }
    var szPID = fs.readFileSync(szTmp, encoding='utf8');
    var szCmd = 'ps aux|grep -v "grep"|grep ' + szPID;
    var p = exec(szCmd, function(err, stdout, stderr){
        if(stdout.indexOf('searchd') > -1 && stdout.indexOf('csft_mysql.conf') > -1){
            cb(true);
        }else{
            cb(false);
        }
    });
};

searchBiz.freshIndex = function(){
    console.log("sphinx data is empty, begin to build index ...");
    var szBin = global.rootPath + "/coreseek/bin/indexer";
    var szCfg = global.rootPath + "/coreseek/etc/csft_mysql.conf.template";
    var szTxt = fs.readFileSync(szCfg, encoding='utf8');
    var szSqlHost = '\tsql_host = ' + global_config.readDB.szDbIP;
    var szSqlUser = '\tsql_user = ' + global_config.readDB.szDbUser;
    var szSqlPass = '\tsql_pass = ' + global_config.readDB.szDbPwd;
    var szSqlDb   = '\tsql_db = ' + global_config.readDB.szDbDefaultDb;
    var szSqlPort = '\tsql_port = ' + global_config.readDB.szDbPort;

    szTxt = szTxt.replace(/^.*sql_host.*$/mg, szSqlHost);
    szTxt = szTxt.replace(/^.*sql_user.*$/mg, szSqlUser);
    szTxt = szTxt.replace(/^.*sql_pass.*$/mg, szSqlPass);
    szTxt = szTxt.replace(/^.*sql_db.*$/mg, szSqlDb);
    szTxt = szTxt.replace(/^.*sql_port.*$/mg, szSqlPort);

    var szNewCfg = szCfg.replace(".template", '');
    fs.writeFileSync(szNewCfg, szTxt, encoding='utf8');
    _.checkPID(function(res){
        var szCmd = "";
        if(res){ //searchd 存在
            console.log("searchd exist, indexer with rotate");
            szCmd = util.format("%s -c %s --all --rotate --quiet", szBin, szNewCfg);
        }else{
            console.log("searchd not exist, indexer without rotate");
            szCmd = util.format("%s -c %s --all --quiet", szBin, szNewCfg);
        }
        _.exec(szCmd, function(){
            szCmd = 'killall -9 searchd';
            _.exec(szCmd);
            iConnection = false;
        });
    });
};

searchBiz.addWord = function(word){
    var szTxt = global.rootPath + "/coreseek/etc/mmseg/unigram.txt";
    var szBin = global.rootPath + "/coreseek/bin/mmseg";
    var szNew = global.rootPath + "/coreseek/etc/mmseg/unigram.txt.uni";
    var szTar = global.rootPath + "/coreseek/etc/mmseg/uni.lib";
    var szCmd = '';
    async.waterfall([
        function(callback){
            var szVal = fs.readFile(szTxt, encoding='utf8', function(err, data){
                if(data.indexOf(word+'\t') == -1){
                    callback();
                }else{
                    console.error("word already exist " + word);
                    callback(1);
                }
            });
        },function(callback){
            var newName = szTxt + moment().format('YYYYMMDDHHmmss');
            szCmd = util.format("cp %s %s", szTxt, newName);
            _.exec(szCmd, function(){
                callback();
            });
        },function(callback){
            szCmd = util.format("%s -u %s", szBin, szTxt);
            fs.appendFileSync(szTxt, word + "\t1\r\nx:1\r\n", encoding='utf8');
            _.exec(szCmd, function(){
                callback();
            });
        },function(callback){
            szCmd = util.format("mv %s %s", szNew, szTar);
            _.exec(szCmd, function(){
                callback();
                console.log("add word to search index " + word);
            });
        }
    ],function(err, result){
    });
};

searchBiz.updateIndex = function(iArticleID, params, cb){
    var szSql = "update mysql set";
    if(typeof params.iProductID !== 'undefined'){
        szSql += util.format(' iproductid=%d,', params.iProductID);
    }
    if(typeof params.iClassID !== 'undefined'){
        szSql += util.format(' iclassid=%d,', params.iClassID);
    }
    if(typeof params.iStatus !== 'undefined'){
        szSql += util.format(' istatus=%d', params.iStatus);
    }
    szSql += ' where id=' + iArticleID;
    console.log(szSql);
    sphinxQL.query(szSql, function(err, rows){
        cb(err, rows);
    });
};

_.needFresh = function(){
    var path = global.rootPath + "/coreseek/data/auto.spa";
    if(!fs.existsSync(path)){
        return true;
    }
    if(!fs.existsSync('./coreseek/etc/csft_mysql.conf')){
        return true;
    }
    var res1 = fs.statSync("./coreseek/etc/csft_mysql.conf.template");
    var res2 = fs.statSync("./coreseek/etc/csft_mysql.conf");
    var r1 = moment(res1.mtime).valueOf();
    var r2 = moment(res2.mtime).valueOf();
    if(r1 > r2){
        return true;
    }
    return false;
};

searchBiz.init = function(){
    var szKey = 'SEARCH_FRESH_INDEX'+networkTool.get_local_ip();
    redis_mgr.regChannel(redis_channel_enum.SEARCH_INDEX, function(szObj){
        redis_mgr.lock(szKey, 10000, function(err, lock){
            if(lock == 'OK'){
                var obj = JSON.parse(szObj);
                console.log("%s get the lock from channel", szKey);
                if(obj.iType == 1){
                    searchBiz.freshIndex();
                }else if(obj.iType == 2){
                    searchBiz.addWord(obj.word);
                }else{
                    console.error("channel SEARCH_INDEX recv error type %s", JSON.stringify(obj));
                }
            }else{
                console.log("%s get the lock from channel fail", szKey);
            }
        });
    });
    redis_mgr.lock(szKey, 10000, function(err, lock){
        if(lock == 'OK'){
            console.log("%s get the lock", szKey);
            if(_.needFresh()){
                searchBiz.freshIndex();
            }
        }
    });
    eventMgr.register(eventDefine.enumType.ARTICLE_UPDATE, function(params){
        if(isNaN(params.iArticleID)){
            return;
        }
        if(isNaN(params.iProductID)){
            delete params.iProductID;
        }
        if(isNaN(params.iClassID)){
            delete params.iClassID;
        }
        if(isNaN(params.iStatus)){
            delete params.iStatus;
        }
        searchBiz.updateIndex(params.iArticleID, params, function(err, rows){
            console.error(rows);
        });
    });
};

_.storeKey = function(szKey){
    if(szKey.length > 64){
        return;
    }
    redis_mgr.sadd2(redis_type_enum.SEARCH_KEY, 'S', szKey, function(err, res){
        if(res === 0){ //第二次添加
            sqlPool.excute(14100, [szKey], function(err, rows){
            });
        }
    });
};

searchBiz.getWord = function(){
    var szTxt = global.rootPath + "/coreseek/etc/mmseg/unigram.txt";
    var szVal = fs.readFileSync(szTxt, encoding='utf8');
    var array = szVal.split('\r\n');
    var res = [];
    for(var i=0; i!=array.length; ++i){
        if(array[i].length > 0 && array[i].indexOf('x:') === -1){
            res.push(array[i].split('\t')[0]);
        }
    }
    return res;
};

module.exports = searchBiz;
