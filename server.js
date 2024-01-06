const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const socket = new socketIO.Server(server);

const clients = new Array();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "/index.html"));
});

socket.on("connection", (io) => {
	io.join("room1");
	const clientID = io.id;

	//when somebody joins the chat
	io.to("room1").emit("user joined", `User ${clientID} joined!`);

	/*
	 * Controls
	 */
	io.on("start", () => {
		io.to("room1").emit("start");
	});

	io.on("pause", () => {
		io.to("room1").emit("pause");
	});

	io.on("resume", () => {
		io.to("room1").emit("resume");
	});

	socket.on("disconnect", (io) => {
		console.log("user left");
		for (let i = 0; i < clients.length; i++) {
			// if userid of disconnected user matches userid of one in array, remove that index
			console.log(io.id);
		}
	});
});

socket.to("room1").emit("randevent");

server.listen(3000, () => {
	console.log(`Server running on port: ${PORT}`);
});
