var file = {};
var crypto = require('crypto');
var fs = require('fs');

var _ = {};

_.checksum = function(str, algorithm, encoding){
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
};


file.getMD5 = function(szFileName, callback){
    fs.readFile(szFileName, function(err, data){
        if(!err && data){
            callback(_.checksum(data));
        }else{
            callback(null);
        }
    });
};
module.exports = file;
