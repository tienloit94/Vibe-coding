import { useState, useEffect, useRef, useCallback } from "react";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  TrendingUp,
  Clock,
  Loader2,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import MiniChatPopup from "@/components/chat/MiniChatPopup";
import PostSkeleton from "@/components/post/PostSkeleton";
import CommentItem from "@/components/post/CommentItem";
import ReactionPicker, {
  ReactionType,
  getReactionSummary,
} from "@/components/post/ReactionPicker";
import CreateSocialGroup from "@/components/groups/CreateSocialGroup";
import StoriesBar from "@/components/story/StoriesBar";
import TagInput from "@/components/ui/TagInput";
import socketService from "@/lib/socket";
import {
  playMessageSound,
  showBrowserNotification,
  requestNotificationPermission,
} from "@/lib/notificationSound";
import { Message } from "@/types";
import imageCompression from "browser-image-compression";
import { getAssetUrl, getApiUrl } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SortType = "chronological" | "edgerank";

export default function HomePageNew() {
  const [postContent, setPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [taggedFriends, setTaggedFriends] = useState<
    Array<{ _id: string; name: string; avatar?: string }>
  >([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [miniChatUserId, setMiniChatUserId] = useState<string | null>(null);
  const [sortType, setSortType] = useState<SortType>("chronological");
  const [page, setPage] = useState(1);
  const [hasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  const {
    posts,
    loading,
    fetchFeed,
    createPost,
    addComment,
    addReaction,
    removeReaction,
  } = usePostStore();
  const { fetchUsers } = useChatStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchFeed();
    fetchUsers();
    requestNotificationPermission();
  }, [fetchFeed, fetchUsers]);

  // Socket listener for incoming messages
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (
        message.sender._id !== user?._id &&
        !message.sender.email?.includes("aibot")
      ) {
        playMessageSound();
        showBrowserNotification(`${message.sender.name} đã nhắn tin cho bạn`, {
          body:
            message.content.substring(0, 50) +
            (message.content.length > 50 ? "..." : ""),
          tag: message.sender._id,
        });
        setMiniChatUserId(message.sender._id);
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

  // Infinite Scroll
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      // Simulate API call - replace with real API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real app: const newPosts = await fetchFeedPaginated(page + 1);
      // setHasMore(newPosts.length > 0);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (lastPostRef.current) {
      observer.observe(lastPostRef.current);
    }

    return () => {
      if (lastPostRef.current) {
        observer.unobserve(lastPostRef.current);
      }
    };
  }, [loadMore, hasMore, loading]);

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortType === "chronological") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // EdgeRank algorithm (simplified)
      const scoreA = (a.likes?.length || 0) * 2 + (a.comments?.length || 0) * 3;
      const scoreB = (b.likes?.length || 0) * 2 + (b.comments?.length || 0) * 3;
      return scoreB - scoreA;
    }
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    if (selectedVideo) {
      setSelectedVideo(null);
      setVideoPreview("");
    }

    const compressedImages: File[] = [];
    const compressedPreviews: string[] = [];

    toast.info("Đang xử lý ảnh...");

    for (const file of files) {
      try {
        const originalSize = file.size / 1024 / 1024;

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

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Video quá lớn. Tối đa 50MB");
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video");
      return;
    }

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

      // Add tagged friends
      if (taggedFriends.length > 0) {
        formData.append(
          "taggedUsers",
          JSON.stringify(taggedFriends.map((f) => f._id))
        );
      }

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
      setTaggedFriends([]);
      setShowTagModal(false);
      toast.success("Đã đăng bài!");
    } catch (error) {
      toast.error("Đăng bài thất bại");
    }
  };

  const handleReaction = async (postId: string, type: ReactionType) => {
    try {
      const post = posts.find((p) => p._id === postId);
      const userReaction = post?.reactions?.find(
        (r) => r.user._id === user?._id || r.user === user?._id
      );

      // If same reaction, remove it
      if (userReaction && userReaction.type === type) {
        await removeReaction(postId);
        toast.success("Đã bỏ cảm xúc");
      } else {
        // Add or update reaction
        await addReaction(postId, type);
        const reactionLabels = {
          like: "Thích",
          love: "Yêu thích",
          haha: "Haha",
          wow: "Wow",
          sad: "Buồn",
          angry: "Phẫn nộ",
        };
        toast.success(`Đã ${reactionLabels[type]}`);
      }
    } catch (error) {
      toast.error("Không thể thêm cảm xúc");
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
      if (error.message && error.message.includes("không phù hợp")) {
        toast.warning(error.message, { duration: 5000 });
      } else {
        toast.error("Không thể đăng bình luận");
      }
    }
  };

  const handleCommentLike = async (postId: string, commentId: string) => {
    try {
      const response = await fetch(
        getApiUrl(`api/posts/${postId}/comment/${commentId}/like`),
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to like comment");

      // Refresh feed to get updated data
      fetchFeed();
    } catch (error) {
      toast.error("Không thể thích bình luận");
    }
  };

  const handleCommentReply = async (
    postId: string,
    commentId: string,
    content: string,
    image?: File
  ) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      console.log("Sending reply:", {
        postId,
        commentId,
        content,
        hasImage: !!image,
      });

      const response = await fetch(
        getApiUrl(`api/posts/${postId}/comment/${commentId}/reply`),
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      console.log("Reply response:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Reply error:", errorData);
        throw new Error(errorData?.message || "Failed to reply");
      }

      toast.success("Phản hồi đã được đăng");
      // Refresh feed to get updated data
      fetchFeed();
    } catch (error: any) {
      console.error("Reply error:", error);
      toast.error(error.message || "Không thể gửi phản hồi");
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const response = await fetch(getApiUrl(`api/posts/${postId}/share`), {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to share post");

      toast.success("Đã chia sẻ bài viết");

      // Refresh feed to get updated data
      fetchFeed();
    } catch (error) {
      toast.error("Không thể chia sẻ bài viết");
    }
  };

  const toggleCommentsSection = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Sort Options */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">News Feed</h2>
        <Select
          value={sortType}
          onValueChange={(value: SortType) => setSortType(value)}
        >
          <SelectTrigger className="w-48 dark:bg-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chronological">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Mới nhất
              </div>
            </SelectItem>
            <SelectItem value="edgerank">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Phổ biến nhất
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stories Bar */}
      <div className="mb-6">
        <StoriesBar />
      </div>

      {/* Create Group Card */}
      <Card className="mb-4 p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg dark:text-white">
              Nhóm Cộng Đồng
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tạo hoặc tham gia nhóm để kết nối với mọi người
            </p>
          </div>
          <CreateSocialGroup />
        </div>
      </Card>

      {/* Create Post */}
      <Card className="mb-6 p-4 dark:bg-gray-800 dark:border-gray-700">
        <Textarea
          placeholder="Bạn đang nghĩ gì?"
          value={postContent}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setPostContent(e.target.value)
          }
          className="mb-3 min-h-[100px] resize-none border-0 focus-visible:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />

        {/* Tagged Friends Display */}
        {taggedFriends.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {taggedFriends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={getAssetUrl(friend.avatar)} />
                  <AvatarFallback className="text-xs">
                    {friend.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{friend.name}</span>
                <button
                  onClick={() =>
                    setTaggedFriends(
                      taggedFriends.filter((f) => f._id !== friend._id)
                    )
                  }
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

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
            <Dialog open={showTagModal} onOpenChange={setShowTagModal}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Gắn thẻ ({taggedFriends.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    Gắn thẻ bạn bè
                  </DialogTitle>
                </DialogHeader>
                <TagInput
                  selectedFriends={taggedFriends}
                  onAddFriend={(friend) =>
                    setTaggedFriends([...taggedFriends, friend])
                  }
                  onRemoveFriend={(friendId) =>
                    setTaggedFriends(
                      taggedFriends.filter((f) => f._id !== friendId)
                    )
                  }
                />
              </DialogContent>
            </Dialog>
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <Card className="p-8 text-center dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có bài viết nào. Hãy chia sẻ điều gì đó!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedPosts.map((post: any, index) => {
            const isLastPost = index === sortedPosts.length - 1;

            return (
              <Card
                key={post._id}
                ref={isLastPost ? lastPostRef : null}
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
                        {post.taggedUsers && post.taggedUsers.length > 0 && (
                          <span className="font-normal text-gray-600 dark:text-gray-400">
                            {" "}
                            cùng với{" "}
                            {post.taggedUsers.map((user: any, idx: number) => (
                              <span key={user._id}>
                                <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                                  {user.name}
                                </span>
                                {idx < post.taggedUsers.length - 1 && ", "}
                              </span>
                            ))}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: vi,
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
                      src={getAssetUrl(post.video)}
                      controls
                      className="w-full rounded-lg max-h-96"
                      playsInline
                      preload="metadata"
                      onError={(e) => {
                        console.error("Video error:", e);
                        console.error("Video src:", getAssetUrl(post.video));
                      }}
                    />
                  </div>
                )}

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {post.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={getAssetUrl(img)}
                        alt="Post"
                        className="w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Reaction Summary */}
                {post.reactions && post.reactions.length > 0 && (
                  <div className="mb-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    {(() => {
                      const summary = getReactionSummary(post.reactions);
                      return (
                        summary && (
                          <>
                            <div className="flex">
                              {summary.emojis.map((emoji, idx) => (
                                <span key={idx} className="text-base">
                                  {emoji}
                                </span>
                              ))}
                            </div>
                            <span>{summary.total}</span>
                          </>
                        )
                      );
                    })()}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between border-t dark:border-gray-700 pt-3">
                  <div className="flex space-x-2">
                    <ReactionPicker
                      onReact={(type) => handleReaction(post._id, type)}
                      currentReaction={
                        post.reactions?.find(
                          (r: any) =>
                            r.user._id === user?._id || r.user === user?._id
                        )?.type as ReactionType | undefined
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCommentsSection(post._id)}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {post.comments?.length || 0}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post._id)}
                  >
                    <Share2 className="mr-1 h-4 w-4" />
                    {post.shares?.length || 0}
                  </Button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <>
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-3 space-y-3 border-t dark:border-gray-700 pt-3">
                        {post.comments.map((comment: any) => (
                          <CommentItem
                            key={comment._id}
                            comment={comment}
                            currentUserId={user?._id}
                            onLike={(commentId) =>
                              handleCommentLike(post._id, commentId)
                            }
                            onReply={(commentId, content, image) =>
                              handleCommentReply(
                                post._id,
                                commentId,
                                content,
                                image
                              )
                            }
                          />
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-3 flex space-x-2 border-t dark:border-gray-700 pt-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                          {user?.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex space-x-2">
                        <Textarea
                          placeholder="Viết bình luận..."
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [post._id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post._id);
                            }
                          }}
                          className="flex-1 min-h-[40px] resize-none dark:bg-gray-700 dark:text-white"
                          rows={1}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleComment(post._id)}
                          disabled={!commentInputs[post._id]?.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            );
          })}

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          )}

          {/* No More Posts Message */}
          {!hasMore && sortedPosts.length > 0 && (
            <Card className="p-6 text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                🎉 Bạn đã xem hết tất cả bài viết!
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Hãy quay lại sau để xem nội dung mới
              </p>
            </Card>
          )}
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
