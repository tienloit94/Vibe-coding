import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, Upload, X } from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";

const categories = [
  "Giáo dục",
  "Công nghệ",
  "Gaming",
  "Thể thao",
  "Âm nhạc",
  "Nghệ thuật",
  "Du lịch",
  "Ẩm thực",
  "Kinh doanh",
  "Sức khỏe",
  "Khác",
];

export default function CreateSocialGroup() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private" | "secret">(
    "public"
  );
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [memberApproval, setMemberApproval] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("privacy", privacy);
      formData.append("category", category);
      formData.append("memberApprovalRequired", String(memberApproval));

      if (tags.trim()) {
        const tagArray = tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
        tagArray.forEach((tag) => formData.append("tags", tag));
      }

      if (avatar) {
        formData.append("avatar", avatar);
      }

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      await axios.post("/groups", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Tạo nhóm thành công!");
      setOpen(false);
      resetForm();

      // Reload page to show new group
      window.location.reload();
    } catch (error: any) {
      const message = error.response?.data?.message || "Không thể tạo nhóm";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrivacy("public");
    setCategory("");
    setTags("");
    setMemberApproval(false);
    setAvatar(null);
    setAvatarPreview("");
    setCoverImage(null);
    setCoverPreview("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Tạo Nhóm Mới
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Tạo Nhóm Cộng Đồng</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Ảnh bìa (không bắt buộc)</Label>
            <div className="relative">
              {coverPreview ? (
                <div className="relative h-40 rounded-lg overflow-hidden">
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Tải ảnh bìa lên
                    </p>
                  </div>
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
          </div>

          {/* Avatar & Basic Info */}
          <div className="flex space-x-4">
            <div className="space-y-2">
              <Label>Ảnh đại diện</Label>
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="cursor-pointer"
              >
                <Avatar className="h-20 w-20 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    <Upload className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên nhóm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Cộng đồng lập trình viên"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả về nhóm của bạn..."
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Privacy & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quyền riêng tư</Label>
              <Select
                value={privacy}
                onValueChange={(value: any) => setPrivacy(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div>
                      <div className="font-medium">Công khai</div>
                      <div className="text-xs text-gray-500">
                        Ai cũng có thể tìm và tham gia
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div>
                      <div className="font-medium">Riêng tư</div>
                      <div className="text-xs text-gray-500">
                        Cần phê duyệt để tham gia
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="secret">
                    <div>
                      <div className="font-medium">Bí mật</div>
                      <div className="text-xs text-gray-500">
                        Chỉ thành viên mới thấy
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="VD: javascript, react, nodejs"
            />
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <Label>Cài đặt</Label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={memberApproval}
                onChange={(e) => setMemberApproval(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Yêu cầu phê duyệt thành viên mới</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? "Đang tạo..." : "Tạo nhóm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
