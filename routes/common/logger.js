var path = require('path')
var log4js = require('log4js');
var config = require('../../config');

log4js.configure({
  appenders: {
    out: { type: 'console' },
    cheese: { 
      type: 'dateFile', 
      filename: path.join(config.log_dir, 'cheese.log'), 
      pattern: '.yyyy-MM-dd', 
      compress: false 
    } 
  },
  categories: { default: { appenders: ['out', 'cheese'], level: 'debug' } }
})

var logger = log4js.getLogger();
logger.level = 'debug'; // default level is OFF - which means no logs at all.

module.exports = logger;
