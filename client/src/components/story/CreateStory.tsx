import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";

interface CreateStoryProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export default function CreateStory({ onSuccess, children }: CreateStoryProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Chỉ hỗ trợ ảnh và video");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File không được vượt quá 50MB");
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!mediaFile) {
      toast.error("Vui lòng chọn ảnh hoặc video");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("media", mediaFile);
      if (content) formData.append("content", content);
      formData.append("backgroundColor", backgroundColor);

      await axios.post("/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Đã tạo story");
      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo story");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent("");
    setBackgroundColor("#000000");
    setMediaFile(null);
    setMediaPreview("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Tạo Story
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo Story mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Media Upload */}
          <div>
            <Label>Ảnh/Video</Label>
            <div className="mt-2">
              {mediaPreview ? (
                <div className="relative">
                  {mediaFile?.type.startsWith("video/") ? (
                    <video
                      src={mediaPreview}
                      className="w-full h-64 object-cover rounded-lg"
                      controls
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview("");
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="flex space-x-4 mb-4">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                      <Video className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click để tải lên</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ảnh hoặc Video (tối đa 50MB)
                    </p>
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <Label>Nội dung (tùy chọn)</Label>
            <Textarea
              placeholder="Viết gì đó..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/500
            </p>
          </div>

          {/* Background Color */}
          <div>
            <Label>Màu nền</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !mediaFile}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo Story"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
