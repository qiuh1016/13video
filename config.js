/*
 * config
 */
var path = require('path');

var config = {
  // log
  showMongoLog: false,
  showRequestLog: true,
  log_dir: path.join(__dirname, 'public/logs'),

  mongodb: 'mongodb://127.0.0.1/cqNode',

  // udp
  udp: {
    localPort: 8000,
    serverPort: 6000,
    serverUrl: "127.0.0.1"
  },

  // 数据库配置
  database: {
    DATABASE: 'cqnode',
    USERNAME: 'root',
    PASSWORD: 'root',
    PORT: '3306',
    HOST: 'localhost'
  }

}

if (process.env.NODE_ENV === 'test') {

}

module.exports = config;