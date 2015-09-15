'use strict'

var misc = {};

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

module.exports = misc;
