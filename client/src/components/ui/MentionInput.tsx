import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import axios from "@/lib/axios";
import { getAssetUrl } from "@/lib/config";

interface Friend {
  _id: string;
  name: string;
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export default function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Viết bình luận...",
  className = "",
}: MentionInputProps) {
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const searchFriends = async () => {
      if (!mentionSearch) {
        setSuggestions([]);
        return;
      }

      try {
        const { data } = await axios.get("/friends/search-for-mention", {
          params: { q: mentionSearch, limit: 5 },
        });
        setSuggestions(data.friends);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Error searching friends:", error);
      }
    };

    const debounce = setTimeout(searchFriends, 200);
    return () => clearTimeout(debounce);
  }, [mentionSearch]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check if user is typing @mention
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    if (lastAtSymbol !== -1 && cursorPos - lastAtSymbol <= 50) {
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1);
      // Check if there's no space or newline after @
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionSearch(textAfterAt);
        setShowSuggestions(true);
        setCursorPosition(lastAtSymbol);
        return;
      }
    }

    setShowSuggestions(false);
    setMentionSearch("");
  };

  const insertMention = (friend: Friend) => {
    const beforeMention = value.slice(0, cursorPosition);
    const afterMention = value.slice(cursorPosition + mentionSearch.length + 1);
    const mentionText = `@[${friend.name}](${friend._id})`;
    const newValue = beforeMention + mentionText + afterMention;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionSearch("");

    // Focus back to input
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = cursorPosition + mentionText.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full resize-none ${className}`}
        rows={2}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 bottom-full mb-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((friend, index) => (
            <button
              key={friend._id}
              onClick={() => insertMention(friend)}
              className={`w-full flex items-center gap-2 px-3 py-2 transition ${
                index === selectedIndex
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
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
    </div>
  );
}
