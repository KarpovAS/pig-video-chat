const express = require("express");
const app = express();

const mongoose = require('mongoose')
const msg = require('./public/message')

app.set("view engine", "ejs");
const server = require("http").Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin:1234@cluster0.1prho.mongodb.net/pig-video-chat?retryWrites=true&w=majority', (err) => {
  console.log("Database connection ", err)
})




app.get('/', function(req,res){
  res.render('main');
});

var moment = require('moment');

app.get('/room', function (req, res){
  let roomName = req.query.room
  let userName = req.query.user

  msg.find({room: roomName}, (error, messages) => {
    res.render('room',{room:roomName, user:userName, msgs: messages, moment: moment })
  })
})


io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.to(roomId).broadcast.emit('serverMessage', userName + " присоединился к " + roomId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
      msg.create({ room: roomId, user: userName, text: message});
    });
  });
});

server.listen(process.env.PORT || 3030);