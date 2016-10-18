var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');



var chatSchema = mongoose.Schema({
	name: String,
	msg: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema);

exports.saveMsg = function(data, cb){
	var newMsg = new Chat({msg: data.msg, name:data.name});
	newMsg.save(function(err){
		cb(err);
	});
};
