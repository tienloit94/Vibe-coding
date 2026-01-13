import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePostStore } from "@/store/postStore";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowLeft,
  X,
  Send,
  Copy,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Globe,
  Moon,
  Sun,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/config";

export default function ReelsPage() {
  const navigate = useNavigate();
  const { posts, fetchFeed, toggleLike, addComment } = usePostStore();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  // Comment dialog state
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareReelId, setShareReelId] = useState<string | null>(null);

  // Filter only video posts
  const reels = posts.filter((post) => post.video);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    // Auto play current video
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.play().catch((err) => console.log("Play error:", err));
      setPlaying(true);
    }

    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause();
      }
    });
  }, [currentIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / windowHeight);

    if (newIndex !== currentIndex && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  };

  const togglePlay = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (playing) {
        currentVideo.pause();
      } else {
        currentVideo.play();
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      toast.error("Failed to like reel");
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.error("Video load error:", {
      src: video.src,
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState,
    });

    // Show more specific error message
    let errorMsg = "Không thể tải video này";
    if (video.error) {
      switch (video.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMsg = "Đã hủy tải video";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMsg = "Lỗi mạng khi tải video";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMsg = "Lỗi giải mã video";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMsg = "Định dạng video không được hỗ trợ";
          break;
      }
    }
    toast.error(errorMsg);
  };

  const handleComment = (reelId: string) => {
    setSelectedReelId(reelId);
    setCommentDialogOpen(true);
  };

  const submitComment = async () => {
    if (!commentText.trim() || !selectedReelId) return;

    try {
      await addComment(selectedReelId, commentText);
      toast.success("Đã thêm bình luận");
      setCommentText("");
      setCommentDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Không thể thêm bình luận");
    }
  };

  const handleShare = (reelId: string) => {
    setShareReelId(reelId);
    setShareDialogOpen(true);
  };

  const copyReelLink = () => {
    const link = `${window.location.origin}/reels?id=${shareReelId}`;
    navigator.clipboard.writeText(link);
    toast.success("Đã sao chép link");
  };

  const shareToSocial = (platform: string) => {
    const link = `${window.location.origin}/reels?id=${shareReelId}`;
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          link
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          link
        )}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (reels.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Card className="p-8 text-center bg-gray-900 border-gray-800">
          <p className="text-gray-400">Chưa có reels nào</p>
          <p className="text-sm text-gray-500 mt-2">
            Hãy đăng video ngắn đầu tiên từ trang chủ!
          </p>
          <Button
            onClick={() => navigate("/home")}
            className="mt-4"
            variant="outline"
          >
            Về trang chủ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black relative"
      onScroll={handleScroll}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Back Button - Fixed at top left */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/30 transition-all hover:bg-black/90 hover:scale-110 shadow-lg"
      >
        <ArrowLeft className="h-6 w-6 text-white" />
      </button>

      {/* Theme and Language Controls - Top Right */}
      <div className="fixed top-20 right-4 z-50 flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/30 transition-all hover:bg-black/90 hover:scale-110 shadow-lg">
              <Globe className="h-6 w-6 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-gray-900 border-gray-700"
          >
            <DropdownMenuLabel className="text-white">
              {t("language")}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => changeLanguage("vi")}
              className="text-white hover:bg-gray-800"
            >
              🇻🇳 Tiếng Việt
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeLanguage("en")}
              className="text-white hover:bg-gray-800"
            >
              🇬🇧 English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeLanguage("ja")}
              className="text-white hover:bg-gray-800"
            >
              🇯🇵 日本語
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={toggleTheme}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/30 transition-all hover:bg-black/90 hover:scale-110 shadow-lg"
        >
          {theme === "light" ? (
            <Moon className="h-6 w-6 text-white" />
          ) : (
            <Sun className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {reels.map((reel, index) => {
        const videoUrl = getAssetUrl(reel.video);
        const isLiked = reel.likes?.some(
          (like: any) => like._id === user?._id || like === user?._id
        );

        // Debug: Log video URL
        if (index === currentIndex) {
          console.log("Current reel video:", {
            originalPath: reel.video,
            fullUrl: videoUrl,
            index,
          });
        }

        return (
          <div
            key={reel._id}
            className="relative h-screen w-full snap-start snap-always flex items-center justify-center"
          >
            {/* Video */}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              loop
              muted={muted}
              playsInline
              preload="auto"
              className="h-full w-full object-contain bg-black"
              onClick={togglePlay}
              onError={handleVideoError}
              onLoadedMetadata={() => {
                console.log("Video loaded successfully:", videoUrl);
              }}
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              <source src={videoUrl} type="video/ogg" />
              <p className="text-white">
                Trình duyệt của bạn không hỗ trợ phát video.
              </p>
            </video>

            {/* Overlay Controls */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Author Info - Bottom Left */}
            <div className="absolute bottom-20 left-4 right-20 z-10 pointer-events-auto">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage
                    src={reel.author.avatar}
                    alt={reel.author.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {reel.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {reel.author.name}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatDistanceToNow(new Date(reel.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {reel.content && (
                <p className="text-white text-sm mb-2 line-clamp-2">
                  {reel.content}
                </p>
              )}
            </div>

            {/* Action Buttons - Right Side */}
            <div className="absolute bottom-20 right-4 z-10 flex flex-col space-y-6 pointer-events-auto">
              {/* Like */}
              <button
                onClick={() => handleLike(reel._id)}
                className="flex flex-col items-center space-y-1 transition-transform hover:scale-110"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    isLiked ? "bg-red-500" : "bg-gray-800/60 backdrop-blur-sm"
                  }`}
                >
                  <Heart
                    className={`h-6 w-6 ${
                      isLiked ? "fill-white text-white" : "text-white"
                    }`}
                  />
                </div>
                <span className="text-xs font-semibold text-white">
                  {reel.likes?.length || 0}
                </span>
              </button>

              {/* Comment */}
              <button
                onClick={() => handleComment(reel._id)}
                className="flex flex-col items-center space-y-1 transition-transform hover:scale-110"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/60 backdrop-blur-sm">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {reel.comments?.length || 0}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={() => handleShare(reel._id)}
                className="flex flex-col items-center space-y-1 transition-transform hover:scale-110"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/60 backdrop-blur-sm">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="flex flex-col items-center space-y-1 transition-transform hover:scale-110"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/60 backdrop-blur-sm">
                  {muted ? (
                    <VolumeX className="h-6 w-6 text-white" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-white" />
                  )}
                </div>
              </button>
            </div>

            {/* Play/Pause Center Button */}
            {!playing && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-transform hover:scale-110">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
              </button>
            )}
          </div>
        );
      })}

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm bình luận</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Viết bình luận của bạn..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  submitComment();
                }
              }}
            />
            <p className="text-xs text-gray-500">Nhấn Ctrl + Enter để gửi</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCommentDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={submitComment} disabled={!commentText.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Gửi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ Reel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={`${window.location.origin}/reels?id=${shareReelId}`}
                className="flex-1"
              />
              <Button size="icon" variant="outline" onClick={copyReelLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Chia sẻ qua:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => shareToSocial("facebook")}
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => shareToSocial("twitter")}
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
