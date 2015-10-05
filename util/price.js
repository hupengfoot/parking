'use strict';

var path = require('path');
var moment = require('moment');
var util = require('util');

var priceDefine = require(path.join(global.rootPath, "config/price"));

var price = {};
var _ = {};
var str = '每%d小时%d元，每天收费上限%d元';

price.calPrice = function(params){
    if(priceDefine[params.iChargesType] == undefined){
	params.iChargesType = 1;
    }
    var func = priceDefine[params.iChargesType].pricefunc + '(params)';
    return eval(func);
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
    var tStart = moment(params.tStart);
    var tEnd = moment(params.tEnd);
    if(tStart.isAfter(tEnd) === true){
	return null;
    }
    if(tStart.isSame(tEnd, 'day') === true){
	var price = Math.ceil((tEnd.toArray()[3] - tStart.toArray()[3]) / params.iPer) * params.iPerPrice;
	return price > params.iMaxPrice ? params.iMaxPrice : price;
    }else{
	var price = Math.floor((tEnd.valueOf() - tStart.valueOf()) / 1000 / 3600 / 24) * params.iMaxPrice;
	console.error(price);
	if(tEnd.toArray()[3] > 12){
	    var makeup = Math.ceil((tEnd.toArray()[3] - 12) / params.iPer) * params.iPerPrice;
	    makeup = makeup > params.iMaxPrice ? params.iMaxPrice : makeup;
	    price = price + makeup;
	}
	return price;
    }
};

module.exports = price;
