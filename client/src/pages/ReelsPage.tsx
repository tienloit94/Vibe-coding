import { useState, useEffect, useRef } from "react";
import { usePostStore } from "@/store/postStore";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function ReelsPage() {
  const { posts, fetchFeed, toggleLike } = usePostStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

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

  if (reels.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Card className="p-8 text-center bg-gray-900 border-gray-800">
          <p className="text-gray-400">Chưa có reels nào</p>
          <p className="text-sm text-gray-500 mt-2">
            Hãy đăng video ngắn đầu tiên!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
      onScroll={handleScroll}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {reels.map((reel, index) => {
        const videoUrl = reel.video;
        const isLiked = reel.likes?.some(
          (like: any) => like._id === reel.author._id
        );

        return (
          <div
            key={reel._id}
            className="relative h-screen w-full snap-start snap-always flex items-center justify-center"
          >
            {/* Video */}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={videoUrl}
              loop
              muted={muted}
              playsInline
              className="h-full w-full object-contain bg-black"
              onClick={togglePlay}
            />

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
              <button className="flex flex-col items-center space-y-1 transition-transform hover:scale-110">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/60 backdrop-blur-sm">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {reel.comments?.length || 0}
                </span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center space-y-1 transition-transform hover:scale-110">
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
    </div>
  );
}
