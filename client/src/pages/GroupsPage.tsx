import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Globe,
  Lock,
  EyeOff,
  TrendingUp,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";
import CreateSocialGroup from "@/components/groups/CreateSocialGroup";
import GroupInvitations from "@/components/groups/GroupInvitations";

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
  createdAt: string;
}

const categories = [
  "Tất cả",
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
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const [allGroupsRes, myGroupsRes] = await Promise.all([
        axios.get("/groups/discover"),
        axios.get("/groups/my-groups"),
      ]);

      setGroups(allGroupsRes.data.groups || []);
      setMyGroups(myGroupsRes.data.groups || []);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Không thể tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await axios.post(`/groups/${groupId}/join`);
      toast.success("Đã gửi yêu cầu tham gia nhóm");
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tham gia nhóm");
    }
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.members.length - a.members.length;
    }
  });

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

  const getPrivacyText = (privacy: string) => {
    switch (privacy) {
      case "public":
        return "Công khai";
      case "private":
        return "Riêng tư";
      case "secret":
        return "Bí mật";
      default:
        return "Công khai";
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

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nhóm</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Khám phá và tham gia các nhóm cộng đồng
          </p>
        </div>
        <CreateSocialGroup />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-groups" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="my-groups">Nhóm của bạn</TabsTrigger>
          <TabsTrigger value="discover">Khám phá</TabsTrigger>
          <TabsTrigger value="invitations">Lời mời</TabsTrigger>
        </TabsList>

        {/* My Groups Tab */}
        <TabsContent value="my-groups" className="space-y-4">
          {myGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Bạn chưa tham gia nhóm nào
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <Link key={group._id} to={`/groups/${group._id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    {group.coverImage && (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={`http://localhost:5000${group.coverImage}`}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={
                              group.avatar.startsWith("http")
                                ? group.avatar
                                : `http://localhost:5000${group.avatar}`
                            }
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {group.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {group.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {group.members.length} thành viên
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm nhóm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Mới nhất</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Phổ biến</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {sortedGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Không tìm thấy nhóm nào
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedGroups.map((group) => (
                <Card
                  key={group._id}
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {group.coverImage && (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={`http://localhost:5000${group.coverImage}`}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            group.avatar.startsWith("http")
                              ? group.avatar
                              : `http://localhost:5000${group.avatar}`
                          }
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {group.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{group.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          {getPrivacyIcon(group.privacy)}
                          <span>{getPrivacyText(group.privacy)}</span>
                        </div>
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {group.members.length} thành viên
                      </span>
                      {group.category && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs">
                          {group.category}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleJoinGroup(group._id)}
                      className="w-full"
                    >
                      Tham gia
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <GroupInvitations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
