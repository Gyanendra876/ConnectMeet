// socket/socket.js

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

let meetings = {}; // in-memory meeting storage

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  /* =========================
     SOCKET AUTH
  ========================= */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

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

    socket.on("join-meeting", (meetingId) => {
      socket.join(meetingId);

      if (!meetings[meetingId]) {
        meetings[meetingId] = [];
      }

      meetings[meetingId].push({
        id: socket.id,
        name: socket.user.name,
      });

      // Send full list to new user
      socket.emit("all-users", meetings[meetingId]);

      // Notify others
      socket.to(meetingId).emit("user-joined", {
        id: socket.id,
        name: socket.user.name,
      });
    });

    socket.on("disconnect", () => {
      for (let meetingId in meetings) {
        meetings[meetingId] = meetings[meetingId].filter(
          (user) => user.id !== socket.id
        );

        socket.to(meetingId).emit("user-left", socket.id);

        if (meetings[meetingId].length === 0) {
          delete meetings[meetingId];
        }
      }

      console.log(socket.user?.name, "disconnected");
    });
  });
}

module.exports = initializeSocket;
