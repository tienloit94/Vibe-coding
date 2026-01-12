import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";

interface Friend {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

interface InviteFriendsDialogProps {
  groupId: string;
  existingMembers: string[]; // Array of user IDs already in group
  onInviteSuccess?: () => void;
}

export default function InviteFriendsDialog({
  groupId,
  existingMembers,
  onInviteSuccess,
}: InviteFriendsDialogProps) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredFriends(
        friends.filter(
          (friend) =>
            friend.name.toLowerCase().includes(query) ||
            friend.email.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredFriends(friends);
    }
  }, [searchQuery, friends]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/friends");
      // Filter out friends who are already members
      const availableFriends = data.friends.filter(
        (friend: Friend) => !existingMembers.includes(friend._id)
      );
      setFriends(availableFriends);
      setFilteredFriends(availableFriends);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách bạn bè"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleInvite = async () => {
    if (selectedFriends.size === 0) {
      toast.error("Vui lòng chọn ít nhất một người bạn");
      return;
    }

    setInviting(true);
    try {
      const { data } = await axios.post(`/groups/${groupId}/invite`, {
        userIds: Array.from(selectedFriends),
      });

      toast.success(data.message || "Đã gửi lời mời thành công");
      setSelectedFriends(new Set());
      setOpen(false);
      onInviteSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi lời mời");
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Mời bạn bè
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mời bạn bè vào nhóm</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {friends.length === 0
                  ? "Không có bạn bè để mời"
                  : "Không tìm thấy bạn bè"}
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleToggleFriend(friend._id)}
                >
                  <Checkbox
                    checked={selectedFriends.has(friend._id)}
                    onCheckedChange={() => handleToggleFriend(friend._id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        friend.avatar?.startsWith("http")
                          ? friend.avatar
                          : friend.avatar
                          ? `http://localhost:5000${friend.avatar}`
                          : undefined
                      }
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {friend.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{friend.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {friend.email}
                    </p>
                  </div>
                  {friend.isOnline && (
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Đã chọn: {selectedFriends.size}
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={inviting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleInvite}
                disabled={inviting || selectedFriends.size === 0}
              >
                {inviting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>Gửi lời mời ({selectedFriends.size})</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
