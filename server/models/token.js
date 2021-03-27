const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: '7200m',
    required: true,
  },
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
