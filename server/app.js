require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const User = require("./models/user");

let meetings = {};

const app = express();
const server = http.createServer(app);

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "https://connectmeet-client.onrender.com",
    credentials: true,
  })
);

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/lobby", require("./routes/lobbyRoutes"));

app.get("/", (req, res) => {
  res.send("Server Running...");
});

/* =========================
   SOCKET SETUP
========================= */
const io = new Server(server, {
  cors: {
    origin: "https://connectmeet-client.onrender.com",
  },
});

/* =========================
   SOCKET AUTH
========================= */
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

/* =========================
   SOCKET EVENTS
========================= */
io.on("connection", (socket) => {
  console.log("User connected:", socket.user.name);

  // ---------------- JOIN MEETING ----------------
  socket.on("join-meeting", (meetingId) => {
    socket.join(meetingId);

    if (!meetings[meetingId]) {
      meetings[meetingId] = [];
    }

    meetings[meetingId].push({
      id: socket.id,
      name: socket.user.name,
    });

    console.log(`${socket.user.name} joined ${meetingId}`);

    // Send existing users to new user
    socket.emit("all-users", meetings[meetingId]);

    // Notify others
    socket.to(meetingId).emit("user-joined", {
      id: socket.id,
      name: socket.user.name,
    });
  });
  

  // ---------------- CHAT ----------------
  socket.on("send-message", ({ meetingId, message }) => {
    if (!meetings[meetingId]) return;

    const user = meetings[meetingId].find(
      (u) => u.id === socket.id
    );
    if (!user) return;

    const messageData = {
      id: Date.now(),
      senderId: socket.id,
      senderName: user.name,
      message,
      time: new Date().toLocaleTimeString(),
    };

    io.to(meetingId).emit("receive-message", messageData);
  });

  // ---------------- WEBRTC SIGNALING ----------------

  // OFFER
  socket.on("offer", ({ offer, to }) => {
  io.to(to).emit("offer", {
    offer,
    from: socket.id,
  });
});
socket.on("camera-status", ({ meetingId, isCameraOff }) => {
  socket.to(meetingId).emit("camera-status", {
    userId: socket.id,
    isCameraOff,
  });
});
socket.on("mute-status", ({ meetingId, isMuted }) => {
  socket.to(meetingId).emit("mute-status", {
    userId: socket.id,
    isMuted,
  });
});
  // ANSWER
  socket.on("answer", ({ answer, to }) => {
  io.to(to).emit("answer", {
    answer,
    from: socket.id,
  });
});

  // ICE CANDIDATE
  socket.on("ice-candidate", ({ candidate, to }) => {
  io.to(to).emit("ice-candidate", {
    candidate,
    from: socket.id,
  });
});

  // ---------------- DISCONNECT ----------------
  socket.on("disconnect", () => {
    console.log(`${socket.user?.name} disconnected`);

    for (let meetingId in meetings) {
      meetings[meetingId] = meetings[meetingId].filter(
        (user) => user.id !== socket.id
      );

      socket.to(meetingId).emit("user-left", socket.id);

      if (meetings[meetingId].length === 0) {
        delete meetings[meetingId];
      }
    }
  });
});

/* =========================
   HELPER: FIND USER ROOM
========================= */
function getRoom(socket) {
  const rooms = [...socket.rooms];
  return rooms.find((room) => room !== socket.id);
}

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
