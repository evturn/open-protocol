var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt');

var note = new mongoose.Schema({
    list         : {type : String},
    created      : {type : Date,    default: new Date()},
    body         : {type : String},
    done         : {type : Boolean, default: false},
    timestamp    : {type : String},
    updated      : {type : String}
});


var list = new mongoose.Schema({
    name         : {type : String},
    icon         : {type : String,  default: 'fa fa-tasks'},
    created      : {type : Date,    default: new Date()},
    notes        : [note],
});

var user = new mongoose.Schema({
    email        : {type : String, sparse: true, unique: true},
    password     : {type : String, sparse: true, required: true},
    username     : {type : String, sparse: true, required: true, unique: true},
    name         : {type : String, sparse: true},
    facebook     : {
      name       : {type : String, sparse: true},
      lastName   : {type : String, sparse: true},
      firstName  : {type : String, sparse: true},
      gender     : {type : String, sparse: true},
      profile    : {type : String, sparse: true},
      id         : {type : String},
      token      : {type : String},
      email      : {type : String, sparse: true}
    },
    twitter      : {
      id         : {type : String},
      token      : {type : String},
      username   : {type : String, sparse: true},
      name       : {type : String, sparse: true},
      location   : {type : String, sparse: true},
      avatar     : {type : String, sparse: true}
    },
    lists        : [list]
});

user.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

user.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', user);
module.exports = mongoose.model('List', list);
module.exports = mongoose.model('Note', note);