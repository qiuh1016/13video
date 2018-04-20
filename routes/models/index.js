var mongoose = require('mongoose');
var config   = require('../../config');
var logger   = require('../common/logger');

mongoose.Promise = global.Promise; 
mongoose.connect(
  config.mongodb,
  {
    poolSize: 20
  },
  function (err) {
    if (err) {
      logger.error('Connect to %s error: ', config.mongodb, err.message)
      process.exit(1);
    }
  }
);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongodb connect error'));
db.once('open', function() {logger.info('Mongodb connect successfully')})

require('./user');
require('./messageServer');

// models
exports.User   = mongoose.model('User');
exports.MessageServer = mongoose.model('MessageServer')