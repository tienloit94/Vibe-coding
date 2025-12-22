import { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useFriendStore } from '@/store/friendStore';
import { getAssetUrl } from '@/lib/config';

interface TagFriendsSelectorProps {
  selectedFriends: string[];
  onSelect: (friendIds: string[]) => void;
}

export default function TagFriendsSelector({ selectedFriends, onSelect }: TagFriendsSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { friends, getFriends } = useFriendStore();

  useEffect(() => {
    if (isOpen && friends.length === 0) {
      getFriends();
    }
  }, [isOpen, friends.length, getFriends]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase()) ||
      friend.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      onSelect(selectedFriends.filter((id) => id !== friendId));
    } else {
      onSelect([...selectedFriends, friendId]);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    onSelect(selectedFriends.filter((id) => id !== friendId));
  };

  const selectedFriendsList = friends.filter((f) => selectedFriends.includes(f._id));

  return (
    <div className="space-y-2">
      {/* Selected Friends Tags */}
      {selectedFriendsList.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {selectedFriendsList.map((friend) => (
            <Badge key={friend._id} variant="secondary" className="flex items-center space-x-1 pr-1">
              <Avatar className="h-5 w-5">
                <AvatarImage 
                  src={getAssetUrl(friend.avatar)} 
                  alt={friend.name} 
                />
                <AvatarFallback className="text-xs">
                  {friend.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{friend.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => handleRemoveFriend(friend._id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Toggle Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start space-x-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <UserPlus className="h-4 w-4" />
        <span>
          {selectedFriends.length > 0
            ? `Đã gắn thẻ ${selectedFriends.length} người`
            : 'Gắn thẻ bạn bè'}
        </span>
      </Button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-2 border-b">
            <Input
              type="text"
              placeholder="Tìm bạn bè..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
          <ScrollArea className="h-64">
            <div className="p-2 space-y-1">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => {
                  const isSelected = selectedFriends.includes(friend._id);
                  return (
                    <button
                      key={friend._id}
                      type="button"
                      onClick={() => handleToggleFriend(friend._id)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getAssetUrl(friend.avatar)} 
                          alt={friend.name} 
                        />
                        <AvatarFallback>
                          {friend.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {friend.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{friend.email}</p>
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <X className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không tìm thấy bạn bè</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
