import { io } from "socket.io-client";

export const socket = io("https://connectmeet-backend.onrender.com", {
  autoConnect: false,
});
