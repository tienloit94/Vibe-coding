import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useGroupStore } from "@/store/groupStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LogOut,
  Search,
  MessageSquare,
  Users as UsersIcon,
} from "lucide-react";
import CreateGroup from "@/components/groups/CreateGroup";
import { Badge } from "@/components/ui/badge";

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { users, selectedUser, selectUser, getUnreadCount } = useChatStore();
  const { groups, selectedGroup, selectGroup, getGroups } = useGroupStore();

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full w-80 flex-col border-r bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Header */}
      <div className="border-b dark:border-gray-700 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage
                src={
                  user?.avatar
                    ? `http://localhost:5000${user.avatar}`
                    : undefined
                }
                alt={user?.name}
              />
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold dark:text-white">{user?.name}</h2>
              <p className="text-xs text-green-600 dark:text-green-400">
                Online
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Create Group Button */}
        <div className="mb-3">
          <CreateGroup />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={
              activeTab === "chats" ? "Search friends..." : "Search groups..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button
            variant={activeTab === "chats" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("chats")}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Chats
          </Button>
          <Button
            variant={activeTab === "groups" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("groups")}
            className="gap-2"
          >
            <UsersIcon className="h-4 w-4" />
            Groups
          </Button>
        </div>
      </div>

      {/* Users/Groups List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {activeTab === "chats" ? (
            // Chats Tab
            filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No users found" : "No friends yet"}
                </p>
              </div>
            ) : (
              filteredUsers.map((chatUser) => {
                const unreadCount = getUnreadCount(chatUser._id);

                return (
                  <button
                    key={chatUser._id}
                    onClick={() => {
                      selectUser(chatUser);
                      selectGroup(null);
                    }}
                    className={`mb-1 flex w-full items-center space-x-3 rounded-lg p-3 transition-colors ${
                      selectedUser?._id === chatUser._id
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage
                          src={
                            chatUser.avatar
                              ? `http://localhost:5000${chatUser.avatar}`
                              : undefined
                          }
                          alt={chatUser.name}
                        />
                        <AvatarFallback>
                          {chatUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {chatUser.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 bg-green-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium dark:text-white">
                        {chatUser.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {chatUser.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-[20px] px-1.5 text-xs"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })
            )
          ) : // Groups Tab
          filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery ? "No groups found" : "No groups yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Create a group to get started
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <button
                key={group._id}
                onClick={() => {
                  selectGroup(group);
                  selectUser(null);
                }}
                className={`mb-1 flex w-full items-center space-x-3 rounded-lg p-3 transition-colors ${
                  selectedGroup?._id === group._id
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {group.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium">{group.name}</p>
                  <p className="text-xs text-gray-500">
                    {group.members.length} members
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
