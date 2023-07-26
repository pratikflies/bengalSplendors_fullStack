const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { resourceLimits } = require('worker_threads');
//Schema- name,email,photo,password,passwordConfirm;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    requiredL: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'], //comes with the validator package included in our package.json dependencies check doucmentation for more details
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a passwords'],
    minLength: 8, //Password contraint
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      //This only works on CREATE OR SAVE OPERATION IN MONGOOSE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //Only run this function if password is actually modified
  if (!this.isModified('password')) {
    return next();
  }
  //Hash the password with cost of 12
  //this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

/*userSchema.pre('save', function (next) {
  if (!this.isModified('password' || this.isNew)) return next();

  this.passwordChangedAt = Date.now() - 1000; //1 second before to avoid bugs
  next();
});*/

userSchema.pre(/^find/, function (next) {
  //runs the middleware before all queries that start with find
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  //False means not changed
  return false;
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  try {
    const res = await bcrypt.compare(candidatePassword, userPassword);
    return res;
  } catch (err) {
    return false;
  }
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
