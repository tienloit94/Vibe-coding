import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  UserX,
  Shield,
  ShieldOff,
  Ban,
  Check,
  X,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
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
  members: Member[];
  admin: Member;
  moderators?: Member[];
  pendingMembers?: Array<{ user: Member; requestedAt: string }>;
  bannedMembers?: Array<{ user: Member; bannedAt: string; reason: string }>;
  memberApprovalRequired: boolean;
  postsEnabled: boolean;
}

export default function GroupManagementPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    privacy: "public",
    category: "",
    tags: "",
    memberApprovalRequired: false,
    postsEnabled: true,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const { data } = await axios.get(`/groups/${groupId}`);
      setGroup(data.group);

      // Initialize edit form
      setEditForm({
        name: data.group.name,
        description: data.group.description || "",
        privacy: data.group.privacy,
        category: data.group.category || "",
        tags: data.group.tags?.join(", ") || "",
        memberApprovalRequired: data.group.memberApprovalRequired || false,
        postsEnabled: data.group.postsEnabled !== false,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải nhóm");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateGroup = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("privacy", editForm.privacy);
      formData.append("category", editForm.category);
      formData.append("tags", editForm.tags);
      formData.append(
        "memberApprovalRequired",
        String(editForm.memberApprovalRequired)
      );
      formData.append("postsEnabled", String(editForm.postsEnabled));

      if (avatarFile) formData.append("avatar", avatarFile);
      if (coverFile) formData.append("coverImage", coverFile);

      await axios.put(`/groups/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Đã cập nhật nhóm");
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await axios.delete(`/groups/${groupId}/members/${userId}`);
      toast.success("Đã xóa thành viên");
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa thành viên");
    }
  };

  const handlePromoteModerator = async (userId: string) => {
    try {
      await axios.post(`/groups/${groupId}/moderators/${userId}`);
      toast.success("Đã thăng cấp moderator");
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể thăng cấp");
    }
  };

  const handleDemoteModerator = async (userId: string) => {
    try {
      await axios.delete(`/groups/${groupId}/moderators/${userId}`);
      toast.success("Đã hạ cấp moderator");
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hạ cấp");
    }
  };

  const handleBanMember = async (userId: string, reason: string) => {
    try {
      await axios.post(`/groups/${groupId}/ban/${userId}`, { reason });
      toast.success("Đã cấm thành viên");
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cấm");
    }
  };

  const handleUnbanMember = async (userId: string) => {
    try {
      await axios.delete(`/groups/${groupId}/ban/${userId}`);
      toast.success("Đã bỏ cấm thành viên");
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể bỏ cấm");
    }
  };

  const handleApproveMember = async (userId: string) => {
    try {
      await axios.post(`/groups/${groupId}/approve/${userId}`);
      toast.success("Đã duyệt thành viên");
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể duyệt");
    }
  };

  const handleRejectMember = async (userId: string) => {
    try {
      await axios.delete(`/groups/${groupId}/approve/${userId}`);
      toast.success("Đã từ chối yêu cầu");
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể từ chối");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`/groups/${groupId}`);
      toast.success("Đã xóa nhóm");
      navigate("/groups");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa nhóm");
    }
  };

  const handleTransferAdmin = async (userId: string) => {
    try {
      await axios.post(`/groups/${groupId}/transfer-admin/${userId}`);
      toast.success("Đã chuyển quyền Admin");
      // Navigate back to group detail since user is no longer admin
      navigate(`/groups/${groupId}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể chuyển quyền Admin"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) return null;

  const isAdmin = group.admin._id === user?._id;
  const isModerator = group.moderators?.some((m) => m._id === user?._id);

  if (!isAdmin && !isModerator) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Không có quyền truy cập</p>
          <Button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="mt-4"
          >
            Quay lại nhóm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(`/groups/${groupId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhóm</h1>
          <p className="text-muted-foreground">{group.name}</p>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          <TabsTrigger value="pending">
            Chờ duyệt
            {group.pendingMembers && group.pendingMembers.length > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {group.pendingMembers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          {isAdmin && <TabsTrigger value="danger">Nguy hiểm</TabsTrigger>}
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">
              Thành viên ({group.members.length})
            </h3>
            <div className="space-y-3">
              {group.members.map((member) => {
                const isMod = group.moderators?.some(
                  (m) => m._id === member._id
                );
                const isGroupAdmin = member._id === group.admin._id;

                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            member.avatar?.startsWith("http")
                              ? member.avatar
                              : member.avatar
                              ? `http://localhost:5000${member.avatar}`
                              : undefined
                          }
                        />
                        <AvatarFallback>
                          {member.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {member.name || "Unknown"}
                          </p>
                          {isGroupAdmin && (
                            <Badge className="bg-red-500 hover:bg-red-600">
                              👑 Admin
                            </Badge>
                          )}
                          {!isGroupAdmin && isMod && (
                            <Badge className="bg-blue-500 hover:bg-blue-600">
                              🛡️ Moderator
                            </Badge>
                          )}
                          {!isGroupAdmin && !isMod && (
                            <Badge variant="outline">Thành viên</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.email || "No email"}
                        </p>
                      </div>
                    </div>

                    {!isGroupAdmin && member._id !== user?._id && (
                      <div className="flex space-x-2">
                        {isAdmin && (
                          <>
                            {isMod ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDemoteModerator(member._id)
                                  }
                                >
                                  <ShieldOff className="h-4 w-4 mr-1" />
                                  Hạ Moderator
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                                    >
                                      👑 Chuyển Admin
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Chuyển quyền Admin?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn sẽ chuyển quyền Admin cho{" "}
                                        {member.name}. Bạn sẽ trở thành
                                        Moderator. Hành động này không thể hoàn
                                        tác!
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleTransferAdmin(member._id)
                                        }
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500"
                                      >
                                        Xác nhận chuyển
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handlePromoteModerator(member._id)
                                  }
                                >
                                  <Shield className="h-4 w-4 mr-1" />
                                  Lên Moderator
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                                    >
                                      👑 Chuyển Admin
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Chuyển quyền Admin?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn sẽ chuyển quyền Admin cho{" "}
                                        {member.name}. Bạn sẽ trở thành
                                        Moderator. Hành động này không thể hoàn
                                        tác!
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleTransferAdmin(member._id)
                                        }
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500"
                                      >
                                        Xác nhận chuyển
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Ban className="h-4 w-4 mr-1" />
                              Cấm
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cấm thành viên?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc muốn cấm {member.name} khỏi nhóm?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleBanMember(member._id, "Vi phạm nội quy")
                                }
                              >
                                Cấm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Banned Members */}
          {group.bannedMembers && group.bannedMembers.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">
                Đã bị cấm ({group.bannedMembers.length})
              </h3>
              <div className="space-y-3">
                {group.bannedMembers.map((banned) => (
                  <div
                    key={banned.user._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={banned.user.avatar} />
                        <AvatarFallback>
                          {banned.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {banned.user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {banned.reason}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnbanMember(banned.user._id)}
                    >
                      Bỏ cấm
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">
              Yêu cầu tham gia ({group.pendingMembers?.length || 0})
            </h3>
            {group.pendingMembers && group.pendingMembers.length > 0 ? (
              <div className="space-y-3">
                {group.pendingMembers.map((pending) => (
                  <div
                    key={pending.user._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={pending.user.avatar} />
                        <AvatarFallback>
                          {pending.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {pending.user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pending.user.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveMember(pending.user._id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Chấp nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectMember(pending.user._id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Không có yêu cầu nào
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {isAdmin && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">
                Chỉnh sửa thông tin nhóm
              </h3>

              {/* Avatar & Cover */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ảnh đại diện</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={
                            avatarPreview ||
                            (group.avatar.startsWith("http")
                              ? group.avatar
                              : `http://localhost:5000${group.avatar}`)
                          }
                        />
                        <AvatarFallback>
                          {group.name?.charAt(0).toUpperCase() || "G"}
                        </AvatarFallback>
                      </Avatar>
                      <label>
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Đổi ảnh
                          </span>
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Ảnh bìa</Label>
                  <div className="mt-2">
                    {(coverPreview || group.coverImage) && (
                      <img
                        src={
                          coverPreview ||
                          `http://localhost:5000${group.coverImage}`
                        }
                        alt="Cover"
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <label>
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {group.coverImage ? "Đổi ảnh bìa" : "Thêm ảnh bìa"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Tên nhóm</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Quyền riêng tư</Label>
                <Select
                  value={editForm.privacy}
                  onValueChange={(value: any) =>
                    setEditForm({ ...editForm, privacy: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Công khai</SelectItem>
                    <SelectItem value="private">Riêng tư</SelectItem>
                    <SelectItem value="secret">Bí mật</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Danh mục</Label>
                <Input
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  placeholder="Ví dụ: Công nghệ, Gaming..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Tags (phân cách bằng dấu phẩy)</Label>
                <Input
                  value={editForm.tags}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tags: e.target.value })
                  }
                  placeholder="react, javascript, coding"
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="memberApproval"
                  checked={editForm.memberApprovalRequired}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      memberApprovalRequired: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="memberApproval" className="cursor-pointer">
                  Yêu cầu duyệt thành viên mới
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="postsEnabled"
                  checked={editForm.postsEnabled}
                  onChange={(e) =>
                    setEditForm({ ...editForm, postsEnabled: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="postsEnabled" className="cursor-pointer">
                  Cho phép thành viên đăng bài
                </Label>
              </div>

              <Button
                onClick={handleUpdateGroup}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Danger Zone Tab */}
        {isAdmin && (
          <TabsContent value="danger" className="space-y-4">
            <Card className="p-6 border-red-200 dark:border-red-900">
              <h3 className="font-semibold text-lg text-red-600 dark:text-red-400 mb-4">
                Vùng nguy hiểm
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Xóa nhóm sẽ không thể khôi phục. Tất cả dữ liệu sẽ bị mất vĩnh
                viễn.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa nhóm
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Nhóm và tất cả dữ liệu
                      sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteGroup}>
                      Xóa nhóm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
