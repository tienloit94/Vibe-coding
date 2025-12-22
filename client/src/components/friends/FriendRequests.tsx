import { useEffect } from 'react';
import { UserCheck, UserX, Loader2 } from 'lucide-react';
import { useFriendStore } from '@/store/friendStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function FriendRequests() {
  const { friendRequests, loading, getFriendRequests, acceptFriendRequest, rejectFriendRequest } =
    useFriendStore();

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  const handleAccept = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleReject = async (requestId: string) => {
    await rejectFriendRequest(requestId);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <Bell className="h-4 w-4" />
          {friendRequests.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {friendRequests.length}
            </Badge>
          )}
          <span className="hidden sm:inline">Requests</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Friend Requests</SheetTitle>
          <SheetDescription>
            {friendRequests.length === 0
              ? 'No pending requests'
              : `You have ${friendRequests.length} pending request${friendRequests.length > 1 ? 's' : ''}`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : friendRequests.length > 0 ? (
            friendRequests.map((request) => (
              <div
                key={request._id}
                className="flex flex-col gap-3 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.sender.avatar} alt={request.sender.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {request.sender.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{request.sender.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.sender.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {request.sender.isOnline && (
                    <div className="h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request._id)}
                    className="flex-1 gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request._id)}
                    className="flex-1 gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No friend requests</p>
              <p className="text-sm mt-1">When someone sends you a request, it will appear here</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
