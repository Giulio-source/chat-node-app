const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const rooms = {};

app.get("/", (req, res) => {
  res.render("index", { rooms: rooms });
});

app.get("/:room", (req, res) => {
  if (!rooms[req.params.room]) {
    return res.redirect("/");
  }
  res.render("room", { room: req.params.room });
});

app.post("/room", (req, res) => {
  const roomName = req.body.room;
  if (rooms[roomName] != null) {
    return res.redirect("/");
  }
  rooms[roomName] = { users: {} };
  console.log(roomName);
  res.redirect(`/${roomName}`);
  io.emit("room-created", roomName);
});

server.listen(3000, () => {
  console.log("Listening on port 3000");
});

io.on("connection", (socket) => {
  socket.on("send-chat-message", (room, message) => {
    socket.to(room).broadcast.emit("chat-message", {
      message: message,
      name: rooms[room].users[socket.id],
    });
  });
  socket.on("new-user", (room, name) => {
    socket.join(room);
    rooms[room].users[socket.id] = name;
    socket.to(room).broadcast.emit("new-user-message", name);
  });
  socket.on("disconnect", () => {
    getUserRooms(socket).forEach((room) => {
      socket
        .to(room)
        .broadcast.emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id]) {
      names.push(name);
    }
    return names;
  }, []);
}
