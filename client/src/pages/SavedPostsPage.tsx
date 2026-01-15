import { useState, useEffect } from "react";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, Heart, MessageCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/config";

export default function SavedPostsPage() {
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchSavedPosts, unsavePost, addReaction } = usePostStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    try {
      setLoading(true);
      const posts = await fetchSavedPosts();
      setSavedPosts(posts);
    } catch (error) {
      toast.error("Không thể tải bài viết đã lưu");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (postId: string) => {
    try {
      await unsavePost(postId);
      setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Đã bỏ lưu bài viết");
    } catch (error) {
      toast.error("Không thể bỏ lưu bài viết");
    }
  };

  const handleReaction = async (postId: string) => {
    try {
      await addReaction(postId, "like");
      // Reload to update reaction count
      loadSavedPosts();
    } catch (error) {
      console.error("Failed to react:", error);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <h1 className="mb-6 text-2xl font-bold text-white">Bài viết đã lưu</h1>
        <div className="text-center py-8 text-muted">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <BookmarkCheck className="mr-2 h-6 w-6 text-primary" />
          Bài viết đã lưu
        </h1>
        <span className="text-sm text-muted">{savedPosts.length} bài viết</span>
      </div>

      {savedPosts.length === 0 ? (
        <Card className="p-8 text-center glass-card border-primary/10">
          <BookmarkCheck className="mx-auto h-16 w-16 text-muted mb-4" />
          <p className="text-muted text-lg mb-2">Chưa có bài viết đã lưu</p>
          <p className="text-muted/70 text-sm">
            Lưu các bài viết quan trọng để xem lại sau
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post: any) => (
            <Card
              key={post._id}
              className="p-4 glass-card border-primary/10 hover:border-primary/20 transition-all"
            >
              {/* Post Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={getAssetUrl(post.author?.avatar)}
                      alt={post.author?.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-teal-400 text-white">
                      {post.author?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">
                      {post.author?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnsave(post._id)}
                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Post Content */}
              <p className="mb-3 text-white whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {post.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={getAssetUrl(image)}
                      alt={`Post image ${index + 1}`}
                      className="w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Post Video */}
              {post.video && (
                <div className="mb-3">
                  <video
                    src={getAssetUrl(post.video)}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {/* Post Stats */}
              <div className="flex items-center justify-between text-sm text-muted border-t border-primary/10 pt-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleReaction(post._id)}
                    className="flex items-center space-x-1 hover:text-primary transition"
                  >
                    <Heart className="h-4 w-4" />
                    <span>
                      {post.reactions?.length || post.likes?.length || 0}
                    </span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>
                <span className="text-xs">
                  Đã lưu{" "}
                  {formatDistanceToNow(new Date(post.createdAt), {
                    locale: vi,
                  })}{" "}
                  trước
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
