import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePostStore } from '@/store/postStore';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, Camera } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import axios from 'axios';
import { getApiUrl, getAssetUrl } from '@/lib/config';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { posts, loading, fetchUserPosts } = usePostStore();
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserPosts(user._id);
      setEditName(user.name);
    }
  }, [user, fetchUserPosts]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploading(true);
      await axios.post(getApiUrl('api/users/avatar'), formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Avatar updated!');
      await checkAuth(); // Refresh user data
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(
        getApiUrl('api/users/profile'),
        { name: editName, bio: editBio },
        { withCredentials: true }
      );
      
      toast.success('Profile updated!');
      await checkAuth(); // Refresh user data
      setIsEditOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* Profile Header */}
      <Card className="mb-6 p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={getAssetUrl(user.avatar)} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-3xl text-white">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-2 flex space-x-4 text-sm">
              <span className="font-semibold">{posts.length} posts</span>
            </div>
          </div>
          
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>
                <Button onClick={handleUpdateProfile} className="w-full">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* User Posts */}
      <div>
        <h2 className="mb-4 text-xl font-bold">My Posts</h2>
        {loading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No posts yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card key={post._id} className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {post.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

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

                <div className="flex items-center space-x-4 border-t pt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Heart className="mr-1 h-4 w-4" />
                    {post.likes?.length || 0} likes
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {post.comments?.length || 0} comments
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
