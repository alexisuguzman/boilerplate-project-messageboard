const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
	let testThreadId;
	let testReplyId;
	let testPass = "testpass";

	test("Create a New Thread", (done) => {
		chai
			.request(server)
			.post("/api/threads/test")
			.send({
				board: "test",
				text: "Functional Test Thread",
				delete_password: testPass,
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				let createdThreadId =
					res.redirects[0].split("/")[res.redirects[0].split("/").length - 1];
				testThreadId = createdThreadId;
				console.log("Test Thread created with id:" + testThreadId);
				done();
			});
	});

	test("Post a reply on a Thread", (done) => {
		chai
			.request(server)
			.post("/api/replies/test")
			.send({
				thread_id: testThreadId,
				text: "Test Reply from Functional Test",
				delete_password: testPass,
			})
			.end((err, res) => {
				assert.equal(res.status, 200);
				let createdReplyId =
					res.redirects[0].split("=")[res.redirects[0].split("=").length - 1];
				testReplyId = createdReplyId;
				console.log("Test Reply created with id:" + testReplyId);
				done();
			});
	});

	test("Get Threads from a Board", (done) => {
		chai
			.request(server)
			.get("/api/threads/test")
			.send()
			.end((err, res) => {
				assert.isArray(res.body);
				let firstThread = res.body[0];
				assert.isUndefined(firstThread.delete_password);
				assert.isAtMost(firstThread.replies.length, 3);
				done();
			});
	});

	test("Get Replies on a Thread", (done) => {
		chai
			.request(server)
			.get("/api/replies/test")
			.query({ thread_id: testThreadId })
			.send()
			.end((err, res) => {
				console.log(res.body);
				let thread = res.body;
				assert.equal(thread._id, testThreadId);
				assert.isUndefined(thread.delete_password);
				assert.isArray(thread.replies);
				done();
			});
	});

	test("Report a Thread", (done) => {
		chai
			.request(server)
			.put("/api/threads/test")
			.send({
				thread_id: testThreadId,
			})
			.end((err, res) => {
				assert.equal(res.text, "reported");
				done();
			});
	});

	test("Report a Reply on a Thread", (done) => {
		chai
			.request(server)
			.put("/api/replies/test")
			.send({
				thread_id: testThreadId,
				reply_id: testReplyId,
			})
			.end((err, res) => {
				assert.equal(res.text, "reported");
			});
		done();
	});

	test("Delete a Reply on a Thread (incorrect password)", (done) => {
		chai
			.request(server)
			.delete("/api/replies/test")
			.send({
				thread_id: testThreadId,
				reply_id: testReplyId,
				delete_password: "incorrect_password",
			})
			.end((err, res) => {
				assert.equal(res.text, "incorrect password");
			});
		done();
	});

	test("Delete a Reply on a Thread (correct password)", (done) => {
		chai
			.request(server)
			.delete("/api/replies/test")
			.send({
				thread_id: testThreadId,
				reply_id: testReplyId,
				delete_password: testPass,
			})
			.end((err, res) => {
				assert.equal(res.text, "success");
			});
		done();
	});

	test("Delete a Thread (correct password)", (done) => {
		chai
			.request(server)
			.delete("/api/threads/test")
			.send({
				thread_id: testThreadId,
				delete_password: testPass,
			})
			.end((err, res) => {
				assert.equal(res.text, "success");
			});
		done();
	});

	test("Delete a Thread (incorrect password)", (done) => {
		chai
			.request(server)
			.delete("/api/threads/test")
			.send({
				thread_id: testThreadId,
				delete_password: "incorrect_password",
			})
			.end((err, res) => {
				assert.equal(res.text, "incorrect password");
			});
		done();
	});
});
