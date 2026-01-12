import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TrendingUp, UserPlus, Hash } from "lucide-react";
import { useFriendStore } from "@/store/friendStore";
import { toast } from "sonner";
import axios from "axios";
import { getApiUrl } from "@/lib/config";

interface TrendingTopic {
  tag: string;
  count: number;
}

export default function RightWidget() {
  const { friends, onlineUsers, getFriends } = useFriendStore();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);

  useEffect(() => {
    getFriends();
    fetchSuggestions();
    fetchTrending();
  }, [getFriends]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(getApiUrl("api/friends/suggestions"), {
        withCredentials: true,
      });
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };

  const fetchTrending = async () => {
    // Mock data - sẽ implement API sau
    setTrending([
      { tag: "#TetNguyenDan", count: 1250 },
      { tag: "#TechNews", count: 890 },
      { tag: "#COVID19", count: 756 },
      { tag: "#Football", count: 654 },
      { tag: "#Music", count: 543 },
    ]);
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await axios.post(
        getApiUrl(`api/friends/request/${userId}`),
        {},
        { withCredentials: true }
      );
      toast.success("Đã gửi lời mời kết bạn");
      setSuggestions(suggestions.filter((s) => s._id !== userId));
    } catch (error) {
      toast.error("Không thể gửi lời mời");
    }
  };

  const onlineFriendsCount = friends.filter((f) => onlineUsers[f._id]).length;

  return (
    <aside className="hidden xl:flex flex-col w-80 space-y-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pr-2">
      {/* Bạn bè đang online */}
      <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-200 flex items-center">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Bạn bè ({friends.length})
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {friends.length > 0 ? (
            friends.slice(0, 10).map((friend) => {
              const isOnline = onlineUsers[friend._id];
              return (
                <div
                  key={friend._id}
                  className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 cursor-pointer transition"
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                        {friend.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium dark:text-white truncate block">
                      {friend.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isOnline ? "Đang hoạt động" : "Offline"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Chưa có bạn bè
            </p>
          )}
        </div>
      </Card>

      {/* Gợi ý kết bạn */}
      {suggestions.length > 0 && (
        <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-200 flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Gợi ý kết bạn
          </h3>
          <div className="space-y-3">
            {suggestions.slice(0, 4).map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.mutualFriends || 0} bạn chung
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddFriend(user._id)}
                  className="ml-2 flex-shrink-0 text-xs"
                >
                  Kết bạn
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Xu hướng - Trending Topics */}
      <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-200 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
          Xu hướng
        </h3>
        <div className="space-y-3">
          {trending.map((topic, index) => (
            <div
              key={index}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 cursor-pointer transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {topic.tag}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {topic.count.toLocaleString()} bài viết
                  </p>
                </div>
                <Hash className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="px-4 py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2026 Social Network • Privacy • Terms
        </p>
      </div>
    </aside>
  );
}
