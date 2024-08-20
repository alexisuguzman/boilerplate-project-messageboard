const mongoose = require("mongoose");
// Reply Schema
const replySchema = new mongoose.Schema({
	text: { type: String, required: true },
	delete_password: { type: String, required: true },
	created_on: { type: Date, required: true },
	reported: { type: Boolean, required: true, default: false },
});

const Reply = new mongoose.model("Reply", replySchema);


// Thread Schema
const threadSchema = new mongoose.Schema({
	board: { type: String, required: true },
	text: { type: String, required: true },
	delete_password: { type: String, required: true },
	created_on: { type: Date, required: true },
	bumped_on: { type: Date, required: true },
	reported: { type: Boolean, required: true, default: false },
	replies: { type: [replySchema], default: [] },
});

const Thread = new mongoose.model("Thread", threadSchema);

module.exports = {Thread, Reply};
