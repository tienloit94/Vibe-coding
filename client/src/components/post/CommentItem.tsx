import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Image as ImageIcon,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  image?: string;
  likes: string[];
  replies?: Comment[];
  createdAt: string;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string, image?: File) => void;
  depth?: number;
}

export default function CommentItem({
  comment,
  currentUserId,
  onLike,
  onReply,
  depth = 0,
}: CommentItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isLiked = comment.likes?.includes(currentUserId || "");
  const maxDepth = 3; // Giới hạn độ sâu

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReplyImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleReply = () => {
    if (replyContent.trim() || replyImage) {
      onReply(comment._id, replyContent, replyImage || undefined);
      setReplyContent("");
      setReplyImage(null);
      setImagePreview("");
      setShowReplyBox(false);
    }
  };

  return (
    <div className={`flex space-x-2 ${depth > 0 ? "ml-8" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
          {comment.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
          <p className="font-semibold text-sm dark:text-white">
            {comment.user.name}
          </p>
          <p className="text-sm dark:text-gray-200 whitespace-pre-wrap">
            {comment.content}
          </p>

          {comment.image && (
            <img
              src={comment.image}
              alt="Comment"
              className="mt-2 rounded-lg max-h-48 object-cover"
            />
          )}
        </div>

        <div className="flex items-center space-x-4 mt-1 ml-3">
          <button
            onClick={() => onLike(comment._id)}
            className={`text-xs font-semibold ${
              isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            } hover:underline`}
          >
            {isLiked ? "Đã thích" : "Thích"}
            {comment.likes?.length > 0 && ` (${comment.likes.length})`}
          </button>

          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:underline"
            >
              Phản hồi
            </button>
          )}

          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>

        {/* Reply Box */}
        {showReplyBox && (
          <div className="mt-2 flex space-x-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarFallback className="bg-gray-400 text-white text-xs">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết phản hồi..."
                  className="border-0 bg-transparent text-sm resize-none focus-visible:ring-0"
                  rows={2}
                />
                {imagePreview && (
                  <div className="px-3 pb-2 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-lg max-h-32"
                    />
                    <button
                      onClick={() => {
                        setReplyImage(null);
                        setImagePreview("");
                      }}
                      className="absolute top-1 right-4 bg-black/50 rounded-full p-1"
                    >
                      <span className="text-white text-xs">✕</span>
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between px-3 pb-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    className="h-7 px-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={!replyContent.trim() && !replyImage}
                    className="h-7 px-3"
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                currentUserId={currentUserId}
                onLike={onLike}
                onReply={onReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
