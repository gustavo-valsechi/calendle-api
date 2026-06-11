const mongoose = require('../database');
const { v4: uuidv4 } = require('uuid');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    auto: true,
  },
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  name: {
    type: String,
  },
  emailPhone: {
    type: String,
  },
  password: {
    type: String,
  },
});

module.exports = mongoose.model('users', UserSchema);
