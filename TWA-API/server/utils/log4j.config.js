var log4js = require('log4js');
var config = require('./../config/log4j.json');
log4js.configure(config.logger);
module.exports = log4js;