"use strict";

module.exports.tables = [
{
    table : 'tbPendingInfo',
    count : 128
},
{
    table : 'tbUserPendingInfo',
    count : 128
},
{
    table : 'tbOrderInfo',
    count : 128
},
{
    table : 'tbUserOrderInfo',
    count : 128
},
{
    table : 'tbUserExchangeInfo',
    count : 128
},
{
    table : 'tbMessageInfo',
    count : 128
},
{
    table : 'tbMessageBox',
    count : 128
}
];

module.exports.getTableCount = function(szName){
    var iLen = module.exports.tables.length;
    for(var i=0; i!=iLen; ++i){
        if(szName == module.exports.tables[i].table){
            return module.exports.tables[i].count;
        }
    }
    return 1;
};
