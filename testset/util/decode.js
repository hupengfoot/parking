global.rootPath = __dirname + '/../../';
var path = require('path');
var decode = require(path.join(global.rootPath, 'util/decode'));

var szPasswd = decode.encodePasswd('xxxxx');
console.error(szPasswd);
var code = decode.decodePasswd('xxxxx');
console.error(code);
