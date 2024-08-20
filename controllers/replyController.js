"use strict";

const { Thread, Reply } = require("../models/Models");

const createReply = async (req, res) => {
	try {
		console.log("Reply body", req.body);
		console.log("Reply params", req.params);
		const newReply = new Reply({
			text: req.body.text,
			delete_password: req.body.delete_password,
			created_on: new Date(),
			reported: false,
		});
		// Push the new reply into the parent thread's replies array
		const updatedThread = await Thread.findByIdAndUpdate(
			req.body.thread_id,
			{
				$push: { replies: newReply },
				bumped_on: newReply.created_on,
			},
			{ new: true }
		);
		console.log("Updated thread: ", updatedThread);
		if (updatedThread) {
			res.redirect(
				"/b/" +
					updatedThread.board +
					"/" +
					updatedThread.id +
					"?new_reply_id=" +
					newReply.id
			);
		} else {
			console.log("Could not upload reply");
			res.status(404).json({ error: "Thread not found" });
		}
		res.end();
	} catch (err) {
		console.error("Error saving reply ", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const getReply = async (req, res) => {
	try {
		let thread = await Thread.findById(req.query.thread_id)
			.select("-delete_password -reported")
			.lean();
		console.log("Thread: ", thread);

		if (thread.replies.length == 0) {
			res.json(thread);
		}

		thread.replies.sort(
			(reply1, reply2) => reply2.createdOn - reply1.createdOn
		);

		thread.replies = thread.replies.map((reply) => {
			const { delete_password, reported, ...rest } = reply;
			return rest;
		});
		res.json(thread);
	} catch (err) {
		console.error("Error fetching thread ", err);
	}
};

const deleteReply = async (req, res) => {
	try {
		console.log("Deleting reply from thread:", req.body);
		const password = req.body.delete_password;

		const threadToChange = await Thread.findById(req.body.thread_id);
		if (threadToChange) {
			console.log("Thread found, deleting...");
			let i;
			for (i = 0; i < threadToChange.replies.length; i++) {
				console.log("Looping over replies");
				console.log("Reply id:", threadToChange.replies[i].id);
				if (threadToChange.replies[i].id === req.body.reply_id) {
					console.log("Found matching reply");
					if (password == threadToChange.replies[i].delete_password) {
						threadToChange.replies[i].text = "[deleted]";
						console.log("Did text update?", threadToChange.replies[i].text);
						const updatedThread = await threadToChange.save();
						if (updatedThread) {
							console.log("Reply deleted successfully", updatedThread);
							res.send("success");
						}
					} else {
						console.log("Incorrect password");
						res.send("incorrect password");
					}
				}
			}
		} else {
			console.log("Thread not found");
		}
	} catch (err) {
		console.error("Error deleting reply:", err);
	}
};

const reportReply = async (req, res) => {
	try {
		console.log("Reporting reply:", req.body);

		const threadToChange = await Thread.findById(req.body.thread_id);

		if (threadToChange) {
			let i;
			for (i = 0; i < threadToChange.replies.length; i++) {
				if (threadToChange.replies[i].id === req.body.reply_id) {
					threadToChange.replies[i].reported = true;
					const updatedThread = await threadToChange.save();
					if (updatedThread) {
						console.log("Reply reported successfully", updatedThread);
						res.send("reported");
					} else {
						console.log("Failed to report reply");
						res.send("failed to report reply");
					}
				}
			}
		} else {
			console.log("Thread not found");
		}
	} catch (err) {
		console.error("Error reporting reply:", err);
	}
};

module.exports = {
	createReply,
	getReply,
	deleteReply,
	reportReply,
};
