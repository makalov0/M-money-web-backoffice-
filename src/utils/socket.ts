// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const createCustomerSocket = (session_id: string): Socket => {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    socket.emit("join_customer", { session_id });
  });

  return socket;
};

export const createAdminSocket = (token: string): Socket => {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => {
    socket.emit("join_admin");
  });

  return socket;
};

export const createEmployeeSocket = (token: string): Socket => {
  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => {
    socket.emit("join_employee");
  });

  return socket;
};
