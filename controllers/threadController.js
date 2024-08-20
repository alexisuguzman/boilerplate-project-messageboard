"use strict";

const { Thread, Reply } = require("../models/Models");

const createThread = async (req, res) => {
	console.log(req.body);
	console.log(req.params);
	const newThread = new Thread({
		board: req.params.board,
		text: req.body.text,
		delete_password: req.body.delete_password,
		created_on: new Date().toUTCString(),
		bumped_on: new Date().toUTCString(),
	});

	try {
		const savedThread = await newThread.save();
		console.log("Saved new board: ", savedThread);
		// Redirect to the new board page
		res.redirect("/b/" + savedThread.board + "/" + savedThread.id);
	} catch (err) {
		console.error("Error saving board: ", err);
	}
};

const getThread = async (req, res) => {
	try {
		// Find the threads by board, sort by bumped_on, limit to 10, and exclude specific fields
		let threads = await Thread.find({ board: req.params.board })
			.sort({ bumped_on: "desc" })
			.limit(10)
			.select("-delete_password -reported")
			.lean(); // Convert documents to plain JavaScript objects

		// Process each thread
		threads = threads.map((thread) => {
			// Add reply count
			thread.replycount = thread.replies.length;

			// Sort replies by createdOn date (descending order)
			thread.replies.sort(
				(reply1, reply2) => reply2.createdOn - reply1.createdOn
			);

			// Limit replies to the 3 most recent
			thread.replies = thread.replies.slice(0, 3);

			// Remove delete_password and reported fields from replies
			thread.replies = thread.replies.map((reply) => {
				const { delete_password, reported, ...rest } = reply;
				return rest;
			});

			return thread;
		});

		// Send the processed threads as the response
		res.json(threads);
	} catch (error) {
		console.error("Error fetching threads:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const deleteThread = async (req, res) => {
	try {
		console.log("Deleting thread:", req.params, req.body);
		const password = req.body.delete_password;

		const thread = await Thread.findById(req.body.thread_id);
		console.log("Thread found to delete:", thread);
		if (password === thread.delete_password) {
			const deletedThread = await Thread.findByIdAndDelete({
				_id: req.body.thread_id,
			});
			console.log("Thread deleted:", deletedThread);
			res.send("success");
		} else {
			res.send("incorrect password");
		}
	} catch (err) {
		console.error("Error deleting thread:", err);
	}
};

const reportThread = async (req, res) => {
	try {
		console.log("Reporting thread:", req.params, req.body);

		const thread = await Thread.findByIdAndUpdate(
			req.body.thread_id,
			{
				$set: { reported: true },
			},
			{ new: true }
		);
		console.log("Thread reported:", thread);
		res.send("reported");
	} catch (err) {
		console.error("Error reporting thread:", err);
	}
};
module.exports = {
	createThread,
	getThread,
	deleteThread,
	reportThread,
};
