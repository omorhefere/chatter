var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var roomSchema = mongoose.Schema({
	name: String,
  user: String,
  topic: String,
  participants: Number,
  type: String,
	created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Room', roomSchema);
