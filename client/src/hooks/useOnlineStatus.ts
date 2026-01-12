import { useEffect } from "react";
import socketService from "@/lib/socket";
import { useFriendStore } from "@/store/friendStore";

export function useOnlineStatus() {
  const { setUserOnline, setUserOffline, setOnlineUsers } = useFriendStore();

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Listen for online status updates
    const handleUserOnline = (userId: string) => {
      console.log("👤 User came online:", userId);
      setUserOnline(userId);
    };

    const handleUserOffline = (userId: string) => {
      console.log("👤 User went offline:", userId);
      setUserOffline(userId);
    };

    const handleOnlineUsers = (userIds: string[]) => {
      console.log("📋 Online users list:", userIds);
      setOnlineUsers(userIds);
    };

    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);
    socket.on("online-users", handleOnlineUsers);

    // Request initial online users list
    socket.emit("get-online-users");

    return () => {
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
      socket.off("online-users", handleOnlineUsers);
    };
  }, [setUserOnline, setUserOffline, setOnlineUsers]);
}
