import { io, Socket } from "socket.io-client";

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  // Remove /api suffix if present, Socket.io uses root path
  return apiUrl.replace(/\/api$/, "");
};

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const url = getSocketUrl();
    console.log("Connecting to WebSocket server:", url);
    
    socket = io(`${url}/live-calls`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};





