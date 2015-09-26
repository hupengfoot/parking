'use strict';

var path = require('path');
var moment = require('moment');
var util = require('util');

var priceDefine = require(path.join(global.rootPath, "config/price"));

var price = {};
var _ = {};
var str = '每%d小时%d元，每天收费上限%d元';

price.calPrice = function(params){
    if(params.tStart === undefined || params.tStart === null || params.tEnd === undefined || params.tEnd === null){
	return null;
    }
    var iTotal = (Date.parse(new Date(params.tEnd)) - Date.parse(new Date(params.tStart))) / 1000 / 60 / 60;
    if(priceDefine[params.iChargesType] !== null && priceDefine[params.iChargesType] !== undefined){
	return iTotal * priceDefine[params.iChargesType].price;
    }else{
	return iTotal * priceDefine[1].price;
    }
};

price.check = function(iChargesType){
    if(priceDefine[iChargesType] === null || priceDefine[iChargesType] === undefined){
	return 0;
    }else{
	return 1;
    }
};

price.getInfo = function(param){
    return util.format(str, param.iPer, param.iPerPrice, param.iMaxPrice);
};

//传入参数
//param.iChargeType
//param.tStart 
//param.tEnd
//param.iPer
//param.iPerPrice
//param.iMaxPrice
_.perHourFunc = function(params){
    if(params.tStart === undefined || params.tStart === null || params.tEnd === undefined || params.tEnd === null){
	return null;
    }
    

};

module.exports = price;
