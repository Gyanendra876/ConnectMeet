import { io } from "socket.io-client";

export const socket = io("https://connectmeet-server.onrender.com/api", {
  autoConnect: false,
});
