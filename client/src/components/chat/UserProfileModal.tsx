import { useEffect, useState } from 'react';
import { X, Mail, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/chatStore';
import { useFriendStore } from '@/store/friendStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { User } from '@/types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);
  const { selectUser } = useChatStore();
  const { friends, sendFriendRequest } = useFriendStore();

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (userData) {
      selectUser(userData);
      onClose();
    }
  };

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(userId);
      toast.success('Đã gửi lời mời kết bạn');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi lời mời kết bạn');
    }
  };

  const isFriend = friends.some(f => f._id === userId);
  const isCurrentUser = currentUser?._id === userId;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800">
                <AvatarImage 
                  src={userData.avatar ? `http://localhost:5000${userData.avatar}` : undefined} 
                  alt={userData.name} 
                />
                <AvatarFallback className="text-4xl">
                  {userData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {userData.isOnline && (
                <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {userData.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
              {userData.isOnline ? (
                <span className="text-green-600 dark:text-green-400">● Đang online</span>
              ) : (
                <span>
                  Hoạt động {userData.lastSeen ? formatDistanceToNow(new Date(userData.lastSeen), { addSuffix: true }) : 'gần đây'}
                </span>
              )}
            </p>
          </div>

          {/* User Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{userData.email}</span>
            </div>
            {userData.bio && (
              <div className="flex items-start gap-3 text-sm">
                <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                <p className="text-gray-700 dark:text-gray-300">{userData.bio}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isCurrentUser && (
            <div className="flex gap-2">
              <Button
                onClick={handleSendMessage}
                className="flex-1"
                variant="default"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Nhắn tin
              </Button>
              {!isFriend && (
                <Button
                  onClick={handleAddFriend}
                  className="flex-1"
                  variant="outline"
                >
                  Kết bạn
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
