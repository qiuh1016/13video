var models = require('../models');
var User = models.User;

/**
 * 获取全部用户
 * @param {Function} callback 
 */
exports.getAll = function (callback) {
  return new Promise((resolve, reject) => {
    User
    .find()
    .exec(function(err, users) {
      if (err) {
        reject(err)
      } else {
        resolve(users);
      }
    });
  })
};