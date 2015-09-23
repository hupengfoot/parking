'use strict'

var misc = {};

misc.getiPhoneNumTail = function(iPhoneNum){
    return iPhoneNum % Math.floor(iPhoneNum / 10000);
};

//低20位为小区号，接入小区阈值为10W
misc.getUniqueID = function(iID1, iID2){
    if(iID2 < 0){
        iID2 = 0;
    }
    return iID1 * Math.pow(2, 20) + parseInt(iID2);
};

misc.getTopID = function(iID){
    return Math.floor(iID / Math.pow(2, 20));
};

misc.getEndID = function(iID){
    return iID % Math.pow(2, 20);
};

misc.getTimeLimit = function(params){
    var szWhere = '';
    if(params.tStart !== null && params.tStart !== undefined && params.tStart.length > 0){
	szWhere = szWhere + " and unix_timestamp(tStart) >= unix_timestamp('" + params.tStart + "') " ;
    }
    if(params.tEnd !== null && params.tEnd !== undefined && params.tEnd.length > 0){
	szWhere = szWhere + " and unix_timestamp(tStart) <= unix_timestamp('" + params.tEnd + "') " ;
    }
    return szWhere;
};

misc.getSectionTimeLimit = function(params){
    var szWhere = '';
    if(params.tStart !== null && params.tStart !== undefined && params.tStart.length > 0){
	szWhere = szWhere + " and unix_timestamp(tStart) <= unix_timestamp('" + params.tStart + "') " ;
    }
    if(params.tEnd !== null && params.tEnd !== undefined && params.tEnd.length > 0){
	szWhere = szWhere + " and unix_timestamp(tEnd) >= unix_timestamp('" + params.tEnd + "') " ;
    }
    return szWhere;
};

module.exports = misc;
