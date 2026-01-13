import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MessageCircle,
  Users,
  Bell,
  User,
  Film,
  UsersRound,
  ShoppingBag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useChatStore } from "@/store/chatStore";
import { useFriendStore } from "@/store/friendStore";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  const { conversations } = useChatStore();
  const { friendRequests } = useFriendStore();

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0
  );

  const navigation = [
    { name: t("home"), href: "/home", icon: Home, badge: 0 },
    {
      name: t("messages"),
      href: "/messages",
      icon: MessageCircle,
      badge: totalUnread,
    },
    { name: "Reels", href: "/reels", icon: Film, badge: 0 },
    { name: "Chợ", href: "/marketplace", icon: ShoppingBag, badge: 0 },
    { name: "Nhóm", href: "/groups", icon: UsersRound, badge: 0 },
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
    <aside className="hidden lg:flex flex-col w-64 border-r bg-white dark:bg-gray-800 dark:border-gray-700 h-full overflow-y-auto">
      <div className="p-4 space-y-1">
        <h2 className="px-4 mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
          {t("menu")}
        </h2>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative",
                active
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
              {item.badge > 0 && (
                <span className="absolute right-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
