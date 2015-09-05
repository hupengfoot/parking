'use strict'

var crypto = require('crypto');  

var decode = {};

decode.decodePasswd = function(szPasswd){
    var alg = 'des-ecb';
    var autoPad = true;
    var key = new Buffer('01234567');
    var iv = new Buffer(0);
    try{
	var decipher = crypto.createDecipheriv(alg, key, iv);  
	var txt = decipher.update(szPasswd, 'hex', 'utf8');  
	txt += decipher.final('utf8');      

	var md5sum = crypto.createHash('md5');
	md5sum.update(txt);
    }catch(e){
	return null;
    }
    return  md5sum.digest('hex');
};

decode.encodePasswd = function(szPasswd){
    var alg = 'des-ecb';
    var autoPad = true;
    var key = new Buffer('01234567');
    var iv = new Buffer(0);

    var cipher = crypto.createCipheriv(alg, key, iv);  
    cipher.setAutoPadding(autoPad)  //default true  
    var ciph = cipher.update(szPasswd, 'utf8', 'hex');  
    ciph += cipher.final('hex');
    return ciph;
};

module.exports = decode;
