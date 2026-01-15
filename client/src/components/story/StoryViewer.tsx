import { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Smile,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { getAssetUrl } from "@/lib/config";

interface Story {
  _id: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  media: string;
  mediaType: "image" | "video";
  backgroundColor: string;
  viewers: Array<{
    user: any;
    viewedAt: string;
  }>;
  reactions?: Array<{
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    emoji: string;
    createdAt: string;
  }>;
  replies?: Array<{
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
  expiresAt: string;
}

interface StoryGroup {
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  stories: Story[];
}

interface StoryViewerProps {
  stories: StoryGroup[];
  initialGroupIndex?: number;
  initialStoryIndex?: number;
  onClose: () => void;
  onDelete?: () => void;
}

export default function StoryViewer({
  stories,
  initialGroupIndex = 0,
  initialStoryIndex = 0,
  onClose,
  onDelete,
}: StoryViewerProps) {
  const user = useAuthStore((state) => state.user);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);

  const currentGroup = stories[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const isOwnStory = currentStory?.author._id === user?._id;

  const emojis = ["❤️", "😂", "😮", "😢", "😡", "👍", "🔥", "🎉"];

  // Control video playback based on isPaused state
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Video play error:", err);
        });
      }
    }
  }, [isPaused, currentStory]);

  // Auto-pause when interacting with emoji picker or reply input
  useEffect(() => {
    if (showEmojiPicker || showReplyInput || showRepliesModal) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [showEmojiPicker, showReplyInput, showRepliesModal]);

  useEffect(() => {
    if (!currentStory || isPaused) return;

    // Mark story as viewed
    markAsViewed(currentStory._id);

    // Progress timer (8 seconds per story for more time to interact)
    const duration = 8000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentGroupIndex, currentStoryIndex, isPaused]);

  const markAsViewed = async (storyId: string) => {
    try {
      await axios.post(`/stories/${storyId}/view`);
    } catch (error) {
      console.error("Failed to mark story as viewed:", error);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else if (currentGroupIndex < stories.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      setCurrentStoryIndex(stories[currentGroupIndex - 1].stories.length - 1);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);

    try {
      await axios.delete(`/stories/${currentStory._id}`);
      toast.success("Đã xóa story");
      onDelete?.();

      // Move to next story or close
      if (currentGroup.stories.length > 1) {
        handleNext();
      } else {
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa story");
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      await axios.post(`/stories/${currentStory._id}/reaction`, { emoji });
      setShowEmojiPicker(false);
      toast.success("Đã thả cảm xúc");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể thả cảm xúc");
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      await axios.post(`/stories/${currentStory._id}/reply`, {
        message: replyMessage.trim(),
      });
      setReplyMessage("");
      setShowReplyInput(false);
      toast.success("Đã gửi trả lời");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi trả lời");
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex space-x-1 p-2">
        {currentGroup.stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width:
                  index < currentStoryIndex
                    ? "100%"
                    : index === currentStoryIndex
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage
              src={
                currentStory.author.avatar?.startsWith("http")
                  ? currentStory.author.avatar
                  : currentStory.author.avatar
                  ? `http://localhost:5000${currentStory.author.avatar}`
                  : undefined
              }
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {currentStory.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-white">
            <p className="font-semibold">{currentStory.author.name}</p>
            <p className="text-xs text-white/80">
              {formatDistanceToNow(new Date(currentStory.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOwnStory && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Eye className="h-4 w-4 mr-1" />
                {currentStory.viewers.length}
              </Button>
              {currentStory.replies && currentStory.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRepliesModal(!showRepliesModal);
                  }}
                >
                  💬 {currentStory.replies.length}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Story Content */}
      <div
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: currentStory.backgroundColor }}
        onClick={(e) => {
          // Only toggle pause if clicking on content, not on controls
          if (
            !showEmojiPicker &&
            !showReplyInput &&
            !showRepliesModal &&
            e.target === e.currentTarget
          ) {
            setIsPaused(!isPaused);
          }
        }}
      >
        {currentStory.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={getAssetUrl(currentStory.media)}
            className="max-h-full max-w-full object-contain"
            autoPlay
            muted
            playsInline
            loop
            onEnded={handleNext}
            onError={(e) => {
              console.error("Video error:", e);
              console.error("Video src:", getAssetUrl(currentStory.media));
              toast.error("Không thể phát video");
            }}
          />
        ) : (
          <img
            src={getAssetUrl(currentStory.media)}
            alt="Story"
            className="max-h-full max-w-full object-contain"
          />
        )}

        {currentStory.content && (
          <div className="absolute bottom-20 left-0 right-0 text-center px-4">
            <p className="text-white text-lg font-medium drop-shadow-lg">
              {currentStory.content}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        onClick={handlePrevious}
        disabled={currentGroupIndex === 0 && currentStoryIndex === 0}
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        onClick={handleNext}
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Pause indicator */}
      {isPaused && !showEmojiPicker && !showReplyInput && !showRepliesModal && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-white text-6xl font-bold opacity-50 animate-pulse">
            ||
          </div>
          <p className="text-white text-sm text-center mt-2 opacity-70">
            Đã tạm dừng
          </p>
        </div>
      )}

      {/* Interaction indicator */}
      {(showEmojiPicker || showReplyInput || showRepliesModal) && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
          ⏸️ Story tạm dừng khi bạn tương tác
        </div>
      )}

      {/* Bottom Interaction Bar */}
      {!isOwnStory && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center space-x-2">
            {/* Emoji Reaction Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmojiPicker(!showEmojiPicker);
                }}
              >
                <Smile className="h-5 w-5" />
              </Button>

              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(emoji);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Input */}
            {showReplyInput ? (
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Nhắn tin cho người đăng..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendReply();
                    }
                  }}
                  className="bg-white/20 text-white placeholder:text-white/60 border-white/30"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendReply();
                  }}
                  disabled={!replyMessage.trim()}
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReplyInput(false);
                    setReplyMessage("");
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Input
                placeholder="Nhắn tin cho người đăng..."
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReplyInput(true);
                }}
                className="flex-1 bg-white/20 text-white placeholder:text-white/60 border-white/30 cursor-text"
                readOnly
              />
            )}
          </div>

          {/* Show reactions summary */}
          {currentStory.reactions && currentStory.reactions.length > 0 && (
            <div className="mt-2 flex items-center space-x-1">
              {Array.from(new Set(currentStory.reactions.map((r) => r.emoji)))
                .slice(0, 5)
                .map((emoji, idx) => (
                  <span key={idx} className="text-lg">
                    {emoji}
                  </span>
                ))}
              <span className="text-white/80 text-sm ml-1">
                {currentStory.reactions.length}
              </span>
            </div>
          )}

          {/* Show reply count for story owner */}
          {isOwnStory &&
            currentStory.replies &&
            currentStory.replies.length > 0 && (
              <div className="mt-2 text-white/80 text-sm">
                {currentStory.replies.length} trả lời
              </div>
            )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa story?</AlertDialogTitle>
            <AlertDialogDescription>
              Story của bạn sẽ bị xóa vĩnh viễn. Bạn không thể hoàn tác hành
              động này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Replies Modal for Story Owner */}
      {isOwnStory && showRepliesModal && (
        <div
          className="absolute inset-0 bg-black/80 flex items-end z-20"
          onClick={() => setShowRepliesModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b sticky top-0 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  Trả lời ({currentStory.replies?.length || 0})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRepliesModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {currentStory.replies && currentStory.replies.length > 0 ? (
                currentStory.replies.map((reply, idx) => (
                  <div key={idx} className="flex space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          reply.user.avatar?.startsWith("http")
                            ? reply.user.avatar
                            : reply.user.avatar
                            ? `http://localhost:5000${reply.user.avatar}`
                            : undefined
                        }
                      />
                      <AvatarFallback>
                        {reply.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <p className="font-medium text-sm">{reply.user.name}</p>
                        <p className="text-sm mt-1">{reply.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-3">
                        {formatDistanceToNow(new Date(reply.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có trả lời nào
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
