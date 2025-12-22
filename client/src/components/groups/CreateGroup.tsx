import { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { useFriendStore } from '@/store/friendStore';
import { useGroupStore } from '@/store/groupStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CreateGroup() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { friends, getFriends } = useFriendStore();
  const { createGroup } = useGroupStore();

  useEffect(() => {
    if (isOpen) {
      getFriends();
    }
  }, [isOpen, getFriends]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedFriends.length === 0) {
      setError('Please select at least one friend');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createGroup({
        name: groupName,
        description: groupDescription,
        members: selectedFriends,
      });

      toast.success('Group created!', {
        description: `"${groupName}" has been created successfully`,
      });
      
      handleClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create group';
      setError(message);
      toast.error('Failed to create group', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setGroupName('');
    setGroupDescription('');
    setSelectedFriends([]);
    setSearchQuery('');
    setError(null);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">New Group</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
            <DialogDescription>
              Create a group with your friends to chat together
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Group Description */}
            <div className="space-y-2">
              <Label htmlFor="group-desc">Description (Optional)</Label>
              <Input
                id="group-desc"
                placeholder="What's this group about?"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>

            {/* Search Friends */}
            <div className="space-y-2">
              <Label>Add Members ({selectedFriends.length} selected)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Friends List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-2">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <label
                    key={friend._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => toggleFriend(friend._id)}
                      className="h-4 w-4"
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
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
                  </label>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
