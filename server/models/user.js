const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const config = require('../utils/config');
const jwt = require('jsonwebtoken');
const Token = require('../models/token');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: String,
  email: {
    type: String,
    trim: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: true,
  },
  bio: String,
  created: {
    type: Date,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
  likedBlogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
    },
  ],
});

userSchema.methods = {
  generateRefreshToken: async function () {
    try {
      const { _id, username } = this;
      let refreshToken = jwt.sign(
        { username: username, id: _id },
        config.REFRESH_TOKEN_SECRET,
        { expiresIn: '5d' }
      );

      const newRefreshToken = await new Token({
        token: refreshToken,
        createdAt: new Date(),
      });
      await newRefreshToken.save();
      return refreshToken;
    } catch (err) {
      console.error(err);
      return;
    }
  },
  generateAccessToken: async function () {
    try {
      const { _id, username } = this;
      let accessToken = jwt.sign(
        { username: username, id: _id },
        config.ACCESS_TOKEN_SECRET,
        { expiresIn: '20m' }
      );
      return accessToken;
    } catch (err) {
      console.error(err);
      return;
    }
  },
};

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

module.exports = User;
