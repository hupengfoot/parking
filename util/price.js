'use strict';

var path = require('path');

var priceDefine = require(path.join(global.rootPath, "config/price"));

var price = {};

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

module.exports = price;
