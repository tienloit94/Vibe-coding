import { useState, useEffect, useRef } from "react";
import { X, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import axios from "@/lib/axios";
import { getAssetUrl } from "@/lib/config";

interface Friend {
  _id: string;
  name: string;
  avatar?: string;
}

interface TagInputProps {
  selectedFriends: Friend[];
  onAddFriend: (friend: Friend) => void;
  onRemoveFriend: (friendId: string) => void;
}

export default function TagInput({
  selectedFriends,
  onAddFriend,
  onRemoveFriend,
}: TagInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchFriends = async () => {
      if (searchQuery.trim().length < 1) {
        setSuggestions([]);
        return;
      }

      try {
        console.log("Searching friends for tag:", searchQuery);
        const { data } = await axios.get("/friends/search-for-mention", {
          params: { q: searchQuery, limit: 5 },
        });

        console.log("Friends search result:", data);

        // Filter out already selected friends
        const filtered = data.friends.filter(
          (friend: Friend) =>
            !selectedFriends.some((sf) => sf._id === friend._id)
        );
        setSuggestions(filtered);
        console.log("Filtered suggestions:", filtered);
      } catch (error) {
        console.error("Error searching friends:", error);
      }
    };

    const debounce = setTimeout(searchFriends, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedFriends]);

  const handleSelectFriend = (friend: Friend) => {
    onAddFriend(friend);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedFriends.map((friend) => (
          <div
            key={friend._id}
            className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={getAssetUrl(friend.avatar)} />
              <AvatarFallback className="text-xs">
                {friend.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{friend.name}</span>
            <button
              onClick={() => onRemoveFriend(friend._id)}
              className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Tìm bạn bè để gắn thẻ..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((friend) => (
              <button
                key={friend._id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectFriend(friend);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAssetUrl(friend.avatar)} />
                  <AvatarFallback>
                    {friend.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm dark:text-white">{friend.name}</span>
              </button>
            ))}
          </div>
        )}

        {showSuggestions &&
          searchQuery.trim().length > 0 &&
          suggestions.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Không tìm thấy bạn bè
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
