import { useState, useEffect, useRef } from "react";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import MiniChatPopup from "@/components/chat/MiniChatPopup";
import socketService from "@/lib/socket";
import {
  playMessageSound,
  showBrowserNotification,
  requestNotificationPermission,
} from "@/lib/notificationSound";
import { Message } from "@/types";
import imageCompression from "browser-image-compression";

export default function HomePage() {
  const [postContent, setPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [miniChatUserId, setMiniChatUserId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { posts, loading, fetchFeed, createPost, toggleLike, addComment } =
    usePostStore();
  const { fetchUsers } = useChatStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchFeed();
    fetchUsers(); // Fetch users for chat
    requestNotificationPermission();
  }, [fetchFeed, fetchUsers]);

  // Socket listener for incoming messages
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Only show mini chat if sender is not current user and not AI bot
      if (
        message.sender._id !== user?._id &&
        !message.sender.email?.includes("aibot")
      ) {
        // Play notification sound
        playMessageSound();

        // Show browser notification
        showBrowserNotification(`${message.sender.name} đã nhắn tin cho bạn`, {
          body:
            message.content.substring(0, 50) +
            (message.content.length > 50 ? "..." : ""),
          tag: message.sender._id,
        });

        // Show mini chat popup
        setMiniChatUserId(message.sender._id);

        // Show toast notification
        toast.info(`Tin nhắn mới từ ${message.sender.name}`, {
          duration: 3000,
        });
      }
    };

    socket.on("message-received", handleNewMessage);

    return () => {
      socket.off("message-received", handleNewMessage);
    };
  }, [user]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    // Clear video if images are selected
    if (selectedVideo) {
      setSelectedVideo(null);
      setVideoPreview("");
    }

    // Compress images before adding
    const compressedImages: File[] = [];
    const compressedPreviews: string[] = [];

    toast.info("Đang xử lý ảnh...");

    for (const file of files) {
      try {
        const originalSize = file.size / 1024 / 1024; // MB

        if (originalSize > 1) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: file.type,
          };

          const compressedFile = await imageCompression(file, options);
          compressedImages.push(compressedFile);
          compressedPreviews.push(URL.createObjectURL(compressedFile));
        } else {
          compressedImages.push(file);
          compressedPreviews.push(URL.createObjectURL(file));
        }
      } catch (error) {
        console.error("Compression error:", error);
        compressedImages.push(file);
        compressedPreviews.push(URL.createObjectURL(file));
      }
    }

    setSelectedImages([...selectedImages, ...compressedImages]);
    setImagePreviews([...imagePreviews, ...compressedPreviews]);

    toast.success("Ảnh đã được xử lý");
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Video quá lớn. Tối đa 50MB");
      return;
    }

    // Check if it's a video file
    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video");
      return;
    }

    // Clear images if video is selected
    if (selectedImages.length > 0) {
      setSelectedImages([]);
      setImagePreviews([]);
    }

    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    toast.success("Video đã được chọn");
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreview("");
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedImages.length === 0 && !selectedVideo) {
      toast.error("Vui lòng viết nội dung hoặc thêm ảnh/video");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", postContent);

      if (selectedVideo) {
        formData.append("video", selectedVideo);
      } else {
        selectedImages.forEach((image) => {
          formData.append("images", image);
        });
      }

      await createPost(formData);
      setPostContent("");
      setSelectedImages([]);
      setSelectedVideo(null);
      setImagePreviews([]);
      setVideoPreview("");
      toast.success("Đã đăng bài!");
    } catch (error) {
      toast.error("Đăng bài thất bại");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      await addComment(postId, content);
      setCommentInputs({ ...commentInputs, [postId]: "" });
      toast.success("Bình luận đã được đăng");
    } catch (error: any) {
      // Check if it's a warning (offensive content detected)
      if (error.message && error.message.includes("không phù hợp")) {
        toast.warning(error.message, { duration: 5000 });
      } else {
        toast.error("Failed to add comment");
      }
    }
  };

  const toggleCommentsSection = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Create Post */}
      <Card className="mb-6 p-4 dark:bg-gray-800 dark:border-gray-700">
        <Textarea
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setPostContent(e.target.value)
          }
          className="mb-3 min-h-[100px] resize-none border-0 focus-visible:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Video Preview */}
        {videoPreview && (
          <div className="mb-3 relative">
            <video
              src={videoPreview}
              controls
              className="w-full rounded-lg max-h-96"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removeVideo}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
              disabled={!!selectedVideo}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
              disabled={selectedImages.length > 0}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              disabled={!!selectedVideo}
              className="dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Ảnh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              disabled={selectedImages.length > 0}
              className="dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Video
            </Button>
          </div>
          <Button
            onClick={handleCreatePost}
            disabled={
              !postContent.trim() &&
              selectedImages.length === 0 &&
              !selectedVideo
            }
          >
            Đăng
          </Button>
        </div>
      </Card>

      {/* News Feed */}
      {loading ? (
        <div className="text-center py-8 dark:text-gray-400">
          Đang tải bài viết...
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No posts yet. Be the first to share something!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post: any) => {
            const isLiked = post.likes?.some(
              (like: any) => like._id === user?._id
            );

            return (
              <Card
                key={post._id}
                className="p-4 dark:bg-gray-800 dark:border-gray-700"
              >
                {/* Post Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
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

                {/* Post Content */}
                <p className="mb-3 whitespace-pre-wrap dark:text-gray-200">
                  {post.content}
                </p>

                {/* Post Video */}
                {post.video && (
                  <div className="mb-3">
                    <video
                      src={`http://localhost:5000${post.video}`}
                      controls
                      className="w-full rounded-lg max-h-96"
                      playsInline
                    />
                  </div>
                )}

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {post.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${img}`}
                        alt="Post"
                        className="w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between border-t dark:border-gray-700 pt-3">
                  <div className="flex space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post._id)}
                      className={isLiked ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`mr-1 h-4 w-4 ${
                          isLiked ? "fill-current" : ""
                        }`}
                      />
                      {post.likes?.length || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCommentsSection(post._id)}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {post.comments?.length || 0}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Comments - Only show when clicked */}
                {showComments[post._id] && (
                  <>
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-3 space-y-2 border-t dark:border-gray-700 pt-3">
                        {post.comments.map((comment: any, idx: number) => (
                          <div key={idx} className="flex space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {comment.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-2">
                              <p className="text-sm font-semibold dark:text-white">
                                {comment.user.name}
                              </p>
                              <p className="text-sm dark:text-gray-200">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-3 flex space-x-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post._id] || ""}
                        onChange={(e) =>
                          setCommentInputs({
                            ...commentInputs,
                            [post._id]: e.target.value,
                          })
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleComment(post._id);
                          }
                        }}
                        className="flex-1 rounded-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-gray-400"
                      />
                      <Button
                        size="icon"
                        onClick={() => handleComment(post._id)}
                        disabled={!commentInputs[post._id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Mini Chat Popup */}
      {miniChatUserId && (
        <MiniChatPopup
          userId={miniChatUserId}
          onClose={() => setMiniChatUserId(null)}
        />
      )}
    </div>
  );
}
