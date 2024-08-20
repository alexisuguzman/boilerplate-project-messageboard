"use strict";

const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

module.exports = function (app) {
	// Theads routes
	app.post("/api/threads/:board", threadController.createThread);
	app.get("/api/threads/:board", threadController.getThread);
	app.delete("/api/threads/:board", threadController.deleteThread);
	app.put("/api/threads/:board", threadController.reportThread);

	// Replies routes
	app.post("/api/replies/:board", replyController.createReply);
	app.get("/api/replies/:board", replyController.getReply);
	app.delete("/api/replies/:board", replyController.deleteReply);
	app.put("/api/replies/:board", replyController.reportReply);
};
