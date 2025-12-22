import { useEffect } from 'react';
import { useFriendStore } from '@/store/friendStore';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';

export default function FriendsPage() {
  const { friends, getFriends, loading } = useFriendStore();
  const { selectUser } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  const handleMessage = (friend: any) => {
    selectUser(friend);
    navigate('/messages');
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Friends</h1>

      {loading ? (
        <div className="text-center py-8">Loading friends...</div>
      ) : friends.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No friends yet. Search for people to add!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <Card key={friend._id} className="p-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={friend.avatar} alt={friend.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-2xl text-white">
                    {friend.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 font-semibold">{friend.name}</h3>
                <p className="text-sm text-gray-500">{friend.email}</p>
                {friend.isOnline && (
                  <span className="mt-2 text-xs text-green-600">● Online</span>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMessage(friend)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
