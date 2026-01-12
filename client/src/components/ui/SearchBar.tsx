import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFriendStore } from "@/store/friendStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const {
    searchResults,
    searchUsers,
    clearSearchResults,
    sendFriendRequest,
    friends,
  } = useFriendStore();
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
        setShowResults(true);
      } else {
        clearSearchResults();
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers, clearSearchResults]);

  const handleClearSearch = () => {
    setSearchQuery("");
    clearSearchResults();
    setShowResults(false);
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      toast.success("Đã gửi lời mời kết bạn");
    } catch (error: any) {
      toast.error(error.message || "Không thể gửi lời mời kết bạn");
    }
  };

  const isFriend = (userId: string) => {
    return friends.some((friend) => friend._id === userId);
  };

  return (
    <div className="relative w-64 hidden md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
      <Input
        type="text"
        placeholder="Tìm kiếm người dùng..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-10 h-10 bg-gray-100 dark:bg-gray-700 border-0 rounded-full"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={handleClearSearch}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Kết quả tìm kiếm ({searchResults.length})
            </p>
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Avatar
                  className="h-10 w-10 cursor-pointer"
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  <AvatarImage
                    src={
                      user.avatar
                        ? `http://localhost:5000${user.avatar}`
                        : undefined
                    }
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>

                {!isFriend(user._id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFriend(user._id)}
                    className="flex-shrink-0"
                  >
                    Kết bạn
                  </Button>
                )}
                {isFriend(user._id) && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0">
                    Bạn bè
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {showResults && searchQuery && searchResults.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Không tìm thấy người dùng nào
          </p>
        </Card>
      )}
    </div>
  );
}
