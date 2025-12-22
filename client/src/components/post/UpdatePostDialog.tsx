import { useState } from 'react';
import { Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import TagFriendsSelector from './TagFriendsSelector';
import axios from 'axios';
import { getApiUrl } from '@/lib/config';

interface UpdatePostDialogProps {
  postId: string;
  initialContent: string;
  initialTaggedUsers: string[];
  onUpdate: () => void;
  trigger?: React.ReactNode;
}

export default function UpdatePostDialog({ 
  postId, 
  initialContent, 
  initialTaggedUsers,
  onUpdate,
  trigger 
}: UpdatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [taggedUsers, setTaggedUsers] = useState<string[]>(initialTaggedUsers);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!content.trim()) {
      toast.error('Nội dung bài viết không được để trống');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        getApiUrl(`api/posts/${postId}`),
        {
          content,
          taggedUsers
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Bài viết đã được cập nhật');

      onUpdate();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setContent(initialContent);
      setTaggedUsers(initialTaggedUsers);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="w-full justify-start space-x-2">
            <Edit className="h-4 w-4" />
            <span>Chỉnh sửa bài viết</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          <DialogDescription>
            Cập nhật nội dung và người được gắn thẻ trong bài viết
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content */}
          <div className="space-y-2">
            <Textarea
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Tag Friends */}
          <TagFriendsSelector
            selectedFriends={taggedUsers}
            onSelect={setTaggedUsers}
          />

          {/* Info */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Những người mới được gắn thẻ sẽ nhận được thông báo
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={loading || !content.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
