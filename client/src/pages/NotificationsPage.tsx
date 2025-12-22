import { useEffect } from 'react';
import { useFriendStore } from '@/store/friendStore';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { friendRequests, fetchFriendRequests, acceptRequest, rejectRequest } = useFriendStore();

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      toast.success('Friend request accepted!');
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      toast.success('Friend request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Notifications</h1>

      {friendRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <UserPlus className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No friend requests</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {friendRequests.map((request) => (
            <Card key={request._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={request.sender.avatar} alt={request.sender.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {request.sender.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{request.sender.name}</p>
                    <p className="text-sm text-gray-500">wants to be your friend</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request._id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request._id)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Decline
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
