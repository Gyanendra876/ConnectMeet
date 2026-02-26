import { io } from "socket.io-client";

export const socket = io("https://connectmeet-server.onrender.com", {
  autoConnect: false,
});
