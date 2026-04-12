import { io } from "socket.io-client";

export const socket = io("https://charismatic-prosperity-production-e142.up.railway.app/api", {
  autoConnect: false,
});
