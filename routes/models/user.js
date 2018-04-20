var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  password: {type: String, default: '12345'},
  permission: {type: Number, default: 4},
  phone: String,
  department: String,
  birthday: String,
  birth_place: String,
  hire_date: String,
  education: String,
  school: String,
  major: String,
  rank: String,
  need_submit_report: {type: Boolean, default: false},
  left_company: {type: Boolean, default: false},
  active: {type: Boolean, default: false},
  create_at: {type: Date, default: Date.now},
  update_at: {type: Date, default: Date.now}
})

UserSchema.pre('save', function(next){
  var now = new Date();
  this.update_at = now;
  next();
});

mongoose.model('User', UserSchema);