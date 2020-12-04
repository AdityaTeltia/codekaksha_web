const path = require("path");
require("dotenv").config();
const express = require("express");
var ExpressPeerServer = require("peer").ExpressPeerServer;
const app = express();

const http = require("http");

const socketio = require("socket.io");

const { userJoin, getRoomUsers, userLeave } = require("./utils/users");

var { nanoid } = require("nanoid");

console.log(process.env.CLIENT_ID);
console.log(process.env.CLIENT_SECRET);

const server = http.createServer(app);

const io = socketio(server);

function onConnection(socket) {
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit("user-disconnected", user.username);
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
  socket.on('join-vid',(peerId,username,room)=>{
    socket.to(room).broadcast.emit('user-vid-connected',peerId,username);
  })
  socket.on("join-room", (roomId, userId, username) => {
    console.log(username)
    const user = userJoin(userId, username, roomId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", username,userId);
    io.to(user.room).emit("roomUsers", getRoomUsers(user.room));
  });
  socket.on("checkId", (room) => {
    let users = getRoomUsers(room);
    console.log(users);
    if (users.length == 0 ) {
      io.to(socket.id).emit('roomIdChecked',0);
    }
    else if(users!=undefined){
      io.to(socket.id).emit('roomIdChecked',1);
    }
  });

  socket.on("drawing", (data, room) =>
    socket.to(room).broadcast.emit("drawing", data)
  );
 

  

  socket.on("give_id", () => {
    let ID = nanoid(4);
    console.log(ID);
    io.to(socket.id).emit("rec_id", ID);
  });
}

io.on("connection", onConnection);
const PORT = process.env.PORT || 3000;
const host = "0.0.0.0";

app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use(express.static(path.join(__dirname, "public")));
server.listen(PORT, host, function () {
  console.log("Server started.......");
});

var options = {
  debug: true,
  allow_discovery: true,
};
let peerServer = ExpressPeerServer(server, options);
app.use("/peerjs", peerServer);
