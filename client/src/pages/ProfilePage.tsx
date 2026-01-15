import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { usePostStore } from "@/store/postStore";
import { useFriendStore } from "@/store/friendStore";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Camera,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import axios from "axios";
import { getApiUrl, getAssetUrl } from "@/lib/config";
import { User } from "@/types";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { posts, loading, fetchUserPosts } = usePostStore();
  const { friends, sendFriendRequest } = useFriendStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : profileUser;

  // Fetch profile user if viewing someone else's profile
  useEffect(() => {
    if (userId && userId !== currentUser?._id) {
      const fetchProfile = async () => {
        try {
          setLoadingProfile(true);
          const response = await axios.get(
            getApiUrl(`api/users/profile/${userId}`),
            {
              withCredentials: true,
            }
          );
          setProfileUser(response.data.user);
        } catch (error) {
          toast.error("Failed to load profile");
        } finally {
          setLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (displayUser) {
      fetchUserPosts(displayUser._id);
      if (isOwnProfile) {
        setEditName(displayUser.name);
        setEditBio(displayUser.bio || "");
      }
    }
  }, [displayUser, fetchUserPosts, isOwnProfile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      await axios.post(getApiUrl("api/users/avatar"), formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Avatar updated!");
      await checkAuth(); // Refresh user data
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(
        getApiUrl("api/users/profile"),
        { name: editName, bio: editBio },
        { withCredentials: true }
      );

      toast.success("Profile updated!");
      await checkAuth(); // Refresh user data
      setIsEditOpen(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAddFriend = async () => {
    if (!displayUser) return;
    try {
      await sendFriendRequest(displayUser._id);
      toast.success("Đã gửi lời mời kết bạn");
    } catch (error) {
      toast.error("Không thể gửi lời mời kết bạn");
    }
  };

  const isFriend = friends.some((friend) => friend._id === displayUser?._id);

  if (loadingProfile || !displayUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Đang tải profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 min-h-screen bg-radial-ambient">
      {/* Profile Header */}
      <Card className="mb-6 p-6 glass-card rounded-2xl border-primary/10">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-2 ring-primary/50">
              <AvatarImage
                src={getAssetUrl(displayUser.avatar)}
                alt={displayUser.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-teal-400 text-3xl text-white">
                {displayUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold dark:text-white">
              {displayUser.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {displayUser.email}
            </p>
            {displayUser.bio ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {displayUser.bio}
              </p>
            ) : isOwnProfile ? (
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500 italic">
                Chưa có giới thiệu. Nhấn "Chỉnh sửa" để thêm.
              </p>
            ) : null}
            <div className="mt-2 flex space-x-4 text-sm">
              <span className="font-semibold dark:text-gray-200">
                {posts.length} bài viết
              </span>
            </div>
          </div>

          {isOwnProfile ? (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Chỉnh sửa</Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    Chỉnh sửa profile
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">
                      Tên
                    </label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Tên của bạn"
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium dark:text-gray-200">
                      Giới thiệu
                    </label>
                    <Textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Giới thiệu về bạn"
                      rows={4}
                      maxLength={200}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {editBio.length}/200 ký tự
                    </p>
                  </div>
                  <Button onClick={handleUpdateProfile} className="w-full">
                    Lưu thay đổi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex space-x-2">
              {!isFriend && (
                <Button onClick={handleAddFriend}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Kết bạn
                </Button>
              )}
              {isFriend && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  ✓ Bạn bè
                </span>
              )}
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nhắn tin
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* User Posts */}
      <div>
        <h2 className="mb-4 text-xl font-bold dark:text-white">
          {isOwnProfile
            ? "Bài viết của tôi"
            : `Bài viết của ${displayUser.name}`}
        </h2>
        {loading ? (
          <div className="text-center py-8 dark:text-gray-400">
            Đang tải bài viết...
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center dark:bg-gray-800 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              Chưa có bài viết nào
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card
                key={post._id}
                className="p-4 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={post.author.avatar}
                        alt={post.author.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {post.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold dark:text-white">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mb-3 whitespace-pre-wrap dark:text-gray-200">
                  {post.content}
                </p>

                {post.images && post.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {post.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Post"
                        className="w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4 border-t pt-3 text-sm text-gray-500 dark:text-gray-400 dark:border-gray-700">
                  <div className="flex items-center">
                    <Heart className="mr-1 h-4 w-4" />
                    {post.likes?.length || 0} thích
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {post.comments?.length || 0} bình luận
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
