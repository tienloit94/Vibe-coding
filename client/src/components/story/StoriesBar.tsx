import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import CreateStory from "./CreateStory";
import StoryViewer from "./StoryViewer";

interface StoryGroup {
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  stories: any[];
}

export default function StoriesBar() {
  const user = useAuthStore((state) => state.user);
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await axios.get("/stories");
      setStories(data.stories || []);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      toast.error("Không thể tải stories");
    } finally {
      setLoading(false);
    }
  };

  const openStoryViewer = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setViewerOpen(true);
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex space-x-4 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {/* Create Story Button */}
          <div className="flex-shrink-0">
            <CreateStory onSuccess={fetchStories}>
              <div className="relative cursor-pointer group">
                <div className="w-24 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <p className="text-xs font-medium text-center mt-2 truncate w-24">
                  Tạo Story
                </p>
              </div>
            </CreateStory>
          </div>

          {/* Story Items */}
          {stories.map((storyGroup, index) => {
            const isOwn = storyGroup.author._id === user?._id;
            const hasUnviewed =
              !isOwn &&
              storyGroup.stories.some(
                (s) => !s.viewers?.some((v: any) => v.user === user?._id)
              );

            return (
              <div
                key={storyGroup.author._id}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => openStoryViewer(index)}
              >
                <div className="relative">
                  {/* Story preview (first story's media) */}
                  <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {storyGroup.stories[0].mediaType === "video" ? (
                      <video
                        src={`http://localhost:5000${storyGroup.stories[0].media}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`http://localhost:5000${storyGroup.stories[0].media}`}
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Author avatar */}
                  <Avatar
                    className={`absolute top-2 left-2 h-10 w-10 border-2 ${
                      hasUnviewed
                        ? "border-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <AvatarImage
                      src={
                        storyGroup.author.avatar?.startsWith("http")
                          ? storyGroup.author.avatar
                          : storyGroup.author.avatar
                          ? `http://localhost:5000${storyGroup.author.avatar}`
                          : undefined
                      }
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                      {storyGroup.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <p className="text-xs font-medium text-center mt-2 truncate w-24">
                  {isOwn ? "Story của bạn" : storyGroup.author.name}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Story Viewer */}
      {viewerOpen && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialGroupIndex={selectedGroupIndex}
          onClose={() => setViewerOpen(false)}
          onDelete={fetchStories}
        />
      )}
    </>
  );
}
