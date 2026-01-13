import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Home,
  MessageCircle,
  User,
  Bell,
  LogOut,
  Users,
  Moon,
  Sun,
  Globe,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useFriendStore } from "@/store/friendStore";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import AISettingsDialog from "@/components/settings/AISettingsDialog";
import MessageDropdown from "@/components/chat/MessageDropdown";
import MiniChatPopup from "@/components/chat/MiniChatPopup";
import Sidebar from "@/components/ui/Sidebar";
import RightWidget from "@/components/ui/RightWidget";
import SearchBar from "@/components/ui/SearchBar";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import socketService from "@/lib/socket";
import { useNotificationStore } from "@/store/notificationStore";
import { toast } from "sonner";

export default function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { conversations, fetchConversations } = useChatStore();
  const { friendRequests, fetchFriendRequests, getFriends } = useFriendStore();
  const { addNotification } = useNotificationStore();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [miniChatUserId, setMiniChatUserId] = useState<string | null>(null);

  // Setup online status tracking
  useOnlineStatus();

  // Hide sidebars on certain routes (like Reels)
  const hideWidgets = location.pathname === "/reels";

  useEffect(() => {
    fetchConversations();
    fetchFriendRequests();
    getFriends();
  }, [fetchConversations, fetchFriendRequests, getFriends]);

  // Setup notification socket listener
  useEffect(() => {
    const socket = socketService.getSocket();
    console.log(
      "MainLayout - Socket instance:",
      socket ? "Connected" : "Not connected"
    );

    if (!socket) return;

    const handleNotification = (notification: any) => {
      console.log("🔔 Received notification:", notification);
      addNotification(notification);

      // Show toast notification
      toast.info(notification.message, {
        description: notification.sender?.name,
        duration: 5000,
      });
    };

    console.log("MainLayout - Setting up notification-received listener");
    socket.on("notification-received", handleNotification);

    return () => {
      console.log("MainLayout - Cleaning up notification-received listener");
      socket.off("notification-received", handleNotification);
    };
  }, [addNotification]);

  // Calculate total unread messages
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0
  );

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const navigation = [
    { name: t("home"), href: "/home", icon: Home, badge: 0 },
    {
      name: t("messages"),
      href: "/messages",
      icon: MessageCircle,
      badge: totalUnread,
    },
    { name: "Nhóm", href: "/groups", icon: Users, badge: 0 },
    { name: t("friends"), href: "/friends", icon: Users, badge: 0 },
    {
      name: t("notifications"),
      href: "/notifications",
      icon: Bell,
      badge: friendRequests.length,
    },
    { name: t("profile"), href: "/profile", icon: User, badge: 0 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar - Facebook Style - STICKY */}
      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Logo & Search */}
          <div className="flex items-center space-x-2 flex-1">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
            </Link>
            <SearchBar />
          </div>

          {/* Center: Main Navigation Icons */}
          <div className="flex items-center justify-center space-x-2 flex-1">
            {navigation.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center justify-center h-12 px-8 rounded-lg transition-colors ${
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={item.name}
                >
                  <Icon className="h-7 w-7" />
                  {item.badge > 0 && (
                    <span className="absolute top-1 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-md"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Settings, Theme, Messenger, Notifications, Profile */}
          <div className="flex items-center justify-end space-x-2 flex-1">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => changeLanguage("vi")}>
                  <span className="mr-2">🇻🇳</span> Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  <span className="mr-2">🇬🇧</span> English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("ja")}>
                  <span className="mr-2">🇯🇵</span> 日本語
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Message Dropdown */}
            <MessageDropdown
              onOpenChat={(userId) => setMiniChatUserId(userId)}
            />

            {/* Notification Dropdown */}
            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        user?.avatar
                          ? `http://localhost:5000${user.avatar}`
                          : undefined
                      }
                      alt={user?.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{t("profile")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <AISettingsDialog />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center space-x-2 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Sidebars */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Sticky */}
        {!hideWidgets && <Sidebar />}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>

        {/* Right Widget - Sticky - Show on large screens except Reels */}
        {!hideWidgets && location.pathname !== "/messages" && <RightWidget />}
      </div>

      {/* Mini Chat Popup */}
      {miniChatUserId && (
        <MiniChatPopup
          userId={miniChatUserId}
          onClose={() => setMiniChatUserId(null)}
        />
      )}
    </div>
  );
}
