var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var chatSchema = mongoose.Schema({
	name: String,
	msg: String,
	room: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema);

exports.saveMsg = function(data, cb){
	var newMsg = new Chat({msg: data.msg, name:data.name, room:data.room});
	newMsg.save(function(err){
		cb(err);
	});
};


exports.getOldMsgs = function(data, cb){

	var query = Chat.find({room:data.room})

	query.sort('-created').limit(data.limit).exec(function(err, docs){

		cb(err,docs);
	});

}
