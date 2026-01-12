import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    console.log(
      "Connecting socket with token:",
      token ? "Token exists" : "No token"
    );

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected, ID:", this.socket?.id);
      this.socket?.emit("setup");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server forcefully disconnected, reconnect
        this.socket?.connect();
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      this.socket?.emit("setup");
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Attempting to reconnect...", attemptNumber);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    // Handle user online/offline status
    this.socket.on("user-online", (userId: string) => {
      console.log("👤 User online:", userId);
    });

    this.socket.on("user-offline", (userId: string) => {
      console.log("👤 User offline:", userId);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
