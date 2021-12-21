const socket = io("/");
const videoGrid = document.querySelector("#video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const returnBtn = document.querySelector("#returnBtn");
myVideo.muted = true;

const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");

muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
});

returnBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector("#showChat").style.display = "flex";
  document.querySelector("#returnBtn").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "0.5";
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "0.5";
  document.querySelector("#returnBtn").style.display = "flex";
  document.querySelector("#showChat").style.display = "none";
});

const { user, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

peer.on("open", (userId) => {
  socket.emit("join-room", room, userId, user);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (myVideoStream) => {
    addVideoStream(video, myVideoStream);
  });
};

let myVideoStream;
navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    .then((stream) => {
      myVideoStream = stream;
      addVideoStream(myVideo, myVideoStream);

      peer.on("call", (call) => {
        call.answer(myVideoStream);
        const video = document.createElement("video");
        call.on("stream", (myVideoStream) => {
          addVideoStream(video, myVideoStream);
        });
      });

      socket.on("user-connected", (userId) => {
        connectToNewUser(userId, stream);
      });
    });

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    videoGrid.append(video);
    video.play();
  });
};

let text = document.querySelector("#chat_message");
let send = document.querySelector("#send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

socket.on("createMessage", (message, userName) => {
  var currentdate = new Date();
  var datetime = currentdate.getHours() + ":"
      + currentdate.getMinutes() + ":"
      + currentdate.getSeconds();
  if (userName === user) {
    messages.innerHTML =
        messages.innerHTML +
        `<div class="d-flex flex-column justify-content-end" style="text-align: right">
        <p style="font-size: 18px"><b style="color: rgba(101,27,255, 1); font-size: 20px">${userName}</b>           ${datetime}</p>
        <p style="font-size: 18px">${message}</p>
    </div>`;
  }
  else{
    messages.innerHTML =
        messages.innerHTML +
        `<div class="d-flex flex-column justify-content-start">
        <p style="font-size: 18px"><b style="color: rgba(101,27,255, 1); font-size: 20px">${userName}</b>           ${datetime}</p>
        <p style="font-size: 18px">${message}</p>
    </div>`;
  }
});

socket.on('serverMessage', (message) => {
  var currentdate = new Date();
  var datetime = currentdate.getHours() + ":"
      + currentdate.getMinutes() + ":"
      + currentdate.getSeconds();
  console.log(message);
  messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
        <p style="font-size: 18px"><b style="color: rgba(101,27,255, 1); font-size: 22px">${message}</b>            ${datetime}</p>
    </div>`;
});