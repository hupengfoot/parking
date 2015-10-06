'use strict'

var express = require('express');
var router = express.Router();
var path = require('path');
var util = require('util');
var url = require('url');
var async = require('async');

var spaceBiz = require(path.join(global.rootPath,'interfaceBiz/spaceBiz'));
var msg = require(path.join(global.rootPath,'define/msg')).global_msg_define;

router.post('/queryspace', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.querySpace(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/detail', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.detail(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/addspace', function(req, res){
    var param = url.parse(req.url, true).query;
    spaceBiz.addSpace(param, function(err, rows, fields){
	msg.wrapper(err, rows, res);
    });
});

router.post('/deletespace', function(req, res){
    var param = url.parse(req.url, true).query;
    async.waterfall([
	function(callback){
	    spaceBiz.detail(param, function(err, rows, fields){
		if(err){
		    callback(err);
		}else{
		    if(rows.length > 0){
			if(rows[0].iStatus > 0){
			    callback(msg.code.ERR_HAS_PENDING_SPACE);
			}else{
			    callback(null);
			}
		    }else{
			callback(msg.code.ERR_NOT_YOUR_SPACE);
		    }
		}
	    });
	},
	function(callback){
	    spaceBiz.deleteSpace(param, function(err, rows, fields){
		callback(err, rows);
	    });
	}
    ], function(err, results){
	msg.wrapper(err, results, res);
    });
});

router.post('/updatespace', function(req, res){
    var param = url.parse(req.url, true).query;
    async.waterfall([
	function(callback){
	    spaceBiz.getMySpace(param, function(err, rows, fields){
		if(!err && rows.length > 0){
		    if(param.iPhoneNum == rows[0].iPhoneNum){
			callback(null);
		    }else{
			callback(msg.code.ERR_NOT_YOUR_SPACE);
		    }
		}else{
		    callback(msg.code.ERR_NOT_YOUR_SPACE);
		}
	    });
	},
	function(callback){
	    spaceBiz.updateSpace(param, function(err, rows, fields){
		callback(err);
	    });
	}
    ], function(err){
	msg.wrapper(err, null, res);
    });
});

module.exports = router;
