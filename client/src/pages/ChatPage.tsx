import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import socketService from "@/lib/socket";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { Message } from "@/types";

export default function ChatPage() {
  const {
    fetchUsers,
    fetchConversations,
    addMessage,
    setOnlineUsers,
    updateUserStatus,
    setTyping,
    selectedUser,
    fetchMessages,
    updateMessageReaction,
  } = useChatStore();

  useEffect(() => {
    fetchUsers();
    fetchConversations();

    // Socket event listeners
    socketService.on("connected", () => {
      console.log("Socket connected successfully");
      // Reload messages for selected user when reconnecting
      if (selectedUser) {
        fetchMessages(selectedUser._id);
      }
    });

    socketService.on("online-users", (users: string[]) => {
      console.log("📡 Online users received:", users);
      setOnlineUsers(users);
      // Update status for all users in the list
      users.forEach((userId) => {
        updateUserStatus(userId, true);
      });
    });

    socketService.on(
      "user-online",
      (data: { userId: string; name: string }) => {
        console.log(`✅ User ${data.name} is now online`);
        updateUserStatus(data.userId, true);
        // Reload messages when the selected user comes online
        if (selectedUser?._id === data.userId) {
          fetchMessages(data.userId);
        }
      }
    );

    socketService.on(
      "user-offline",
      (data: { userId: string; name: string }) => {
        updateUserStatus(data.userId, false);
      }
    );

    socketService.on("message-received", (message: Message) => {
      addMessage(message);
      // Refresh conversations to update unread count
      fetchConversations();
    });

    socketService.on("message-sent", (message: Message) => {
      addMessage(message);
      // Refresh conversations to update unread count
      fetchConversations();
    });

    socketService.on("typing", (data: { userId: string; name: string }) => {
      if (selectedUser?._id === data.userId) {
        setTyping(true, data.name);
      }
    });

    socketService.on("stop-typing", (data: { userId: string }) => {
      if (selectedUser?._id === data.userId) {
        setTyping(false);
      }
    });

    socketService.on("message-reaction-updated", (message: Message) => {
      updateMessageReaction(message);
    });

    return () => {
      socketService.off("connected");
      socketService.off("online-users");
      socketService.off("user-online");
      socketService.off("user-offline");
      socketService.off("message-received");
      socketService.off("message-sent");
      socketService.off("typing");
      socketService.off("stop-typing");
      socketService.off("message-reaction-updated");
    };
  }, [selectedUser]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
