const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  // Event untuk bergabung ke room tertentu
  socket.on("joinRoom", (roomName, user) => {
    if (!socket.rooms.has(roomName)) {
      socket.join(roomName);
      io.to(roomName).emit("chat message", `${user} has joined ${roomName}`);
      const sizeRooms = io.sockets.adapter.rooms.get(roomName);
      io.to(roomName).emit("online", sizeRooms.size);
    }
  });

  socket.on("leaveRoom", (roomName) => {
    console.log(roomName);
    io.to(roomName).emit(
      "chat message",
      `User ${socket.id} left room: ${roomName}`
    );
    socket.leave(roomName);
  });

  // Event untuk mengirim pesan ke room tertentu
  socket.on("chat message", (message, roomName, user) => {
    console.log(`message: ${message} sent to room: ${roomName}`);

    io.to(roomName).emit("chat message", `${user} : ${message}`);
  });

  socket.on("disconnect", () => {
    io.emit("chat message", `User ${socket.id} left the chat`);
    // io.to(socket.rooms.)
    // socket.rooms.forEach((room) => {
    //   console.log(room);
    // });
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
