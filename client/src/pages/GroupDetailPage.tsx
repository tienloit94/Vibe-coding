import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Settings,
  ArrowLeft,
  Send,
  Globe,
  Lock,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import ReactionPicker, {
  ReactionType,
  getReactionSummary,
} from "@/components/post/ReactionPicker";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import InviteFriendsDialog from "@/components/groups/InviteFriendsDialog";

interface Post {
  _id: string;
  author: any;
  content: string;
  images?: string[];
  isAnonymous: boolean;
  reactions?: Array<{
    user: any;
    type: ReactionType;
    createdAt: string;
  }>;
  comments?: any[];
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage?: string;
  privacy: "public" | "private" | "secret";
  category?: string;
  tags?: string[];
  members: any[];
  admin: any;
  moderators?: any[];
  rules?: Array<{ title: string; description: string }>;
}

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, postsRes] = await Promise.all([
        axios.get(`/groups/${groupId}`),
        axios.get(`/posts/group/${groupId}`),
      ]);

      setGroup(groupRes.data.group);
      setPosts(postsRes.data.posts || []);
    } catch (error: any) {
      console.error("Failed to fetch group:", error);
      toast.error(error.response?.data?.message || "Không thể tải nhóm");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }

    setPosting(true);
    try {
      const { data } = await axios.post("/posts", {
        content: postContent,
        group: groupId,
        isAnonymous,
        visibility: "public",
      });

      setPosts([data, ...posts]);
      setPostContent("");
      setIsAnonymous(false);
      toast.success("Đăng bài thành công");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đăng bài");
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (postId: string, type: ReactionType) => {
    try {
      const post = posts.find((p) => p._id === postId);
      const userReaction = post?.reactions?.find(
        (r: any) => r.user._id === user?._id || r.user === user?._id
      );

      if (userReaction && userReaction.type === type) {
        await axios.delete(`/posts/${postId}/reaction`);
        toast.success("Đã bỏ cảm xúc");
      } else {
        await axios.post(`/posts/${postId}/reaction`, { type });
      }

      // Refresh posts
      const { data } = await axios.get(`/posts/group/${groupId}`);
      setPosts(data.posts || []);
    } catch (error) {
      toast.error("Không thể thêm cảm xúc");
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Bạn có chắc muốn rời nhóm?")) return;

    try {
      await axios.delete(`/groups/${groupId}/leave`);
      toast.success("Đã rời nhóm");
      navigate("/groups");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể rời nhóm");
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "private":
        return <Lock className="h-4 w-4" />;
      case "secret":
        return <EyeOff className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Không tìm thấy nhóm</p>
          <Button onClick={() => navigate("/groups")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const isMember = group.members.some((m: any) => m._id === user?._id);
  const isAdmin = group.admin._id === user?._id;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Nhóm</h1>
      </div>

      {/* Cover Image */}
      {group.coverImage && (
        <div className="h-64 rounded-lg overflow-hidden">
          <img
            src={`http://localhost:5000${group.coverImage}`}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Group Info */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20 border-2">
              <AvatarImage
                src={
                  group.avatar.startsWith("http")
                    ? group.avatar
                    : `http://localhost:5000${group.avatar}`
                }
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{group.name}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  {getPrivacyIcon(group.privacy)}
                  <span className="capitalize">{group.privacy}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{group.members.length} thành viên</span>
                </div>
              </div>
              {group.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {group.description}
                </p>
              )}
              {group.tags && group.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {group.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isMember && !isAdmin && (
              <Button variant="outline" onClick={handleLeaveGroup}>
                Rời nhóm
              </Button>
            )}
            {(isAdmin ||
              group.moderators?.some((m: any) => m._id === user?._id)) && (
              <>
                <InviteFriendsDialog
                  groupId={group._id}
                  existingMembers={group.members.map((m: any) => m._id)}
                  onInviteSuccess={fetchGroupData}
                />
                <Button
                  variant="outline"
                  onClick={() => navigate(`/groups/${group._id}/manage`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Quản lý
                </Button>
              </>
            )}
          </div>
        </div>

        {group.category && (
          <div className="mt-4 pt-4 border-t">
            <span className="text-sm text-gray-500">Danh mục: </span>
            <span className="text-sm font-medium">{group.category}</span>
          </div>
        )}
      </Card>

      {isMember ? (
        <>
          {/* Create Post */}
          <Card className="p-4">
            <Textarea
              placeholder={`Viết gì đó trong ${group.name}...`}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="mb-3 min-h-[100px] resize-none"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <UserCheck className="h-4 w-4" />
                <span className="text-sm">Đăng ẩn danh</span>
              </label>

              <Button
                onClick={handleCreatePost}
                disabled={posting || !postContent.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                {posting ? "Đang đăng..." : "Đăng bài"}
              </Button>
            </div>
          </Card>

          {/* Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!
                </p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post._id} className="p-4">
                  {/* Post Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage
                        src={post.isAnonymous ? undefined : post.author?.avatar}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                        {post.isAnonymous
                          ? "?"
                          : post.author?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {post.isAnonymous
                          ? "Thành viên ẩn danh"
                          : post.author?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

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

                  {/* Reactions Summary */}
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
                  <div className="border-t pt-3">
                    <ReactionPicker
                      onReact={(type) => handleReaction(post._id, type)}
                      currentReaction={
                        post.reactions?.find(
                          (r: any) =>
                            r.user._id === user?._id || r.user === user?._id
                        )?.type as ReactionType | undefined
                      }
                    />
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <Card className="p-8 text-center">
          <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Bạn cần tham gia nhóm để xem bài viết
          </p>
        </Card>
      )}
    </div>
  );
}
