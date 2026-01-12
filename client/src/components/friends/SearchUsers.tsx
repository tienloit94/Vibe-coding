import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, X, Loader2, User as UserIcon } from "lucide-react";
import { useFriendStore } from "@/store/friendStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SearchUsers() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const {
    searchResults,
    loading,
    searchUsers,
    sendFriendRequest,
    clearSearchResults,
  } = useFriendStore();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.trim()) {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(query);
      }, 300);
    } else {
      clearSearchResults();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, searchUsers, clearSearchResults]);

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    clearSearchResults();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search Users</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Search Users</DialogTitle>
            <DialogDescription>
              Search for users by name or email to send friend requests
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProfile(user._id)}
                        className="gap-2"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Xem</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(user._id)}
                        className="gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Kết bạn</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : query.trim() ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Start typing to search for users
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
