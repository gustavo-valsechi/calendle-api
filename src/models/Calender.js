const mongoose = require('../database');

const Schema = mongoose.Schema;

const CalendarSchema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    auto: true,
  },
  uuid_customer: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  dt_start: {
    type: Date,
  },
  dt_end: {
    type: Date,
  },
});

module.exports = mongoose.model('Calendar', CalendarSchema);
