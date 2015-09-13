/* jshint node:true*/
"use strict";
var os = require('os');  
var networkInterfaces = os.networkInterfaces();

var network = {};

network.getClientIp = function(req) {
    return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};

var szAddr = ''; 
for(var index in networkInterfaces){
    if(index !== 'lo') {
        var address = networkInterfaces[index][0].address;
        console.log('get local ip %s',address);
        var ipsplit = address.split('.');
        if(ipsplit[0] === '10'){
            szAddr = address;
        }
    }
}

network.get_local_ip = function() {
    return szAddr;
};

module.exports = network;

