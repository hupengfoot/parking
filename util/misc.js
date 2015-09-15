'use strict'

var misc = {};

misc.getUniqueID = function(iID1, iID2){
    if(iID2 < 0){
        iID2 = 0;
    }
    return iID1 * Math.pow(2, 32) + parseInt(iID2);
};

misc.getTopID = function(iID){
    return Math.floor(iID / Math.pow(2, 32));
};

misc.getEndID = function(iID){
    return iID % Math.pow(2, 32);
};

module.exports = misc;
