'use strict'
var logConf = require('../config/parking_log_conf.json');
var log4js = require('log4js');
var logger = log4js.getLogger('access');

log4js.configure(logConf);

module.exports.logger = logger;
