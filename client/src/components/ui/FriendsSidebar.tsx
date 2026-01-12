import { useEffect } from "react";
import { useFriendStore } from "@/store/friendStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";

export default function FriendsSidebar() {
  const { friends, getFriends, onlineUsers } = useFriendStore();
  const { selectUser } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  const handleStartChat = (friend: any) => {
    selectUser(friend);
    navigate("/messages");
  };

  const sortedFriends = [...friends].sort((a, b) => {
    const aOnline = onlineUsers[a._id] || false;
    const bOnline = onlineUsers[b._id] || false;
    if (aOnline === bOnline) return 0;
    return aOnline ? -1 : 1;
  });

  return (
    <aside className="hidden xl:flex flex-col w-80 border-l bg-white dark:bg-gray-800 dark:border-gray-700 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="px-2 mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
          Bạn bè ({friends.length})
        </h2>

        <div className="space-y-2">
          {sortedFriends.length === 0 ? (
            <Card className="p-4 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-800/50">
              Bạn chưa có người bạn nào
            </Card>
          ) : (
            sortedFriends.map((friend) => {
              const isOnline = onlineUsers[friend._id] || false;
              return (
                <div
                  key={friend._id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                    isOnline && "bg-green-50 dark:bg-green-900/10"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          friend.avatar
                            ? `http://localhost:5000${friend.avatar}`
                            : undefined
                        }
                        alt={friend.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {friend.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online Status Indicator */}
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800",
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {friend.name}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        isOnline
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {isOnline ? "Đang hoạt động" : "Không hoạt động"}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStartChat(friend)}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
