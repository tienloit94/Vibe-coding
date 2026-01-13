import { useEffect, useState } from "react";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Heart,
  Search,
  Filter,
  MessageCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getAssetUrl } from "@/lib/config";
import { formatDistanceToNow } from "date-fns";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Books",
  "Sports",
  "Toys",
  "Other",
];

const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

export default function MarketplacePage() {
  const {
    products,
    loading,
    fetchProducts,
    createProduct,
    toggleLikeProduct,
    deleteProduct,
    updateProduct,
  } = useProductStore();
  const { user } = useAuthStore();
  const { selectUser } = useChatStore();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Other");
  const [condition, setCondition] = useState("Good");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts({
      category: selectedCategory === "All" ? undefined : selectedCategory,
      search: searchQuery || undefined,
    });
  }, [selectedCategory, fetchProducts]);

  const handleSearch = () => {
    fetchProducts({
      category: selectedCategory === "All" ? undefined : selectedCategory,
      search: searchQuery || undefined,
    });
  };

  const formatPrice = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    // Format with thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setPrice(formatted);
  };

  const handleChatWithSeller = (seller: any) => {
    if (seller._id === user?._id) {
      toast.info("Đây là sản phẩm của bạn");
      return;
    }
    selectUser(seller);
    navigate("/chat");
  };

  const handleCreateProduct = async () => {
    if (!title || !description || !price) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price.replace(/,/g, ""));
    formData.append("category", category);
    formData.append("condition", condition);
    if (location) formData.append("location", location);

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      setSubmitting(true);
      await createProduct(formData);
      toast.success("Đã đăng sản phẩm thành công!");
      setIsCreateOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("Other");
      setCondition("Good");
      setLocation("");
      setImages(null);
    } catch (error) {
      toast.error("Không thể đăng sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (productId: string) => {
    try {
      await toggleLikeProduct(productId);
    } catch (error) {
      toast.error("Không thể thích sản phẩm");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(formatPrice(product.price.toString()));
    setCategory(product.category);
    setCondition(product.condition);
    setLocation(product.location || "");
    setIsEditOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!title || !description || !price || !editingProduct) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price.replace(/,/g, ""));
    formData.append("category", category);
    formData.append("condition", condition);
    if (location) formData.append("location", location);

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      setSubmitting(true);
      await updateProduct(editingProduct._id, formData);
      toast.success("Đã cập nhật sản phẩm!");
      setIsEditOpen(false);
      setEditingProduct(null);
      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("Other");
      setCondition("Good");
      setLocation("");
      setImages(null);
    } catch (error) {
      toast.error("Không thể cập nhật sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">Chợ</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Đăng bán
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                Đăng sản phẩm mới
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Tiêu đề *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tên sản phẩm"
                  maxLength={100}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Mô tả *
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết sản phẩm"
                  rows={4}
                  maxLength={1000}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Giá (VNĐ) *
                </label>
                <Input
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="dark:bg-gray-700 dark:text-white"
                />
                {price && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(parseFloat(price.replace(/,/g, "")) || 0)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium dark:text-gray-200">
                    Danh mục
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium dark:text-gray-200">
                    Tình trạng
                  </label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {cond}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Địa điểm
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Thành phố, quận..."
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Hình ảnh (tối đa 5)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(e.target.files)}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <Button
                onClick={handleCreateProduct}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Đang đăng..." : "Đăng sản phẩm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                Chỉnh sửa sản phẩm
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Tiêu đề *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tên sản phẩm"
                  maxLength={100}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Mô tả *
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết sản phẩm"
                  rows={4}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Giá *
                </label>
                <Input
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium dark:text-gray-200">
                    Danh mục *
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium dark:text-gray-200">
                    Tình trạng *
                  </label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {cond}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Địa điểm
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Thành phố, quận..."
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium dark:text-gray-200">
                  Thêm hình ảnh mới (tối đa 5)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(e.target.files)}
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <Button
                onClick={handleUpdateProduct}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6 p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="dark:bg-gray-700 dark:text-white"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Chưa có sản phẩm nào
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Đăng bán ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const isLiked = product.likes.some(
              (like: any) => like._id === user?._id || like === user?._id
            );

            return (
              <Card
                key={product._id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {product.images[0] ? (
                    <img
                      src={getAssetUrl(product.images[0])}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Không có ảnh
                    </div>
                  )}
                  {product.status === "sold" && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Đã bán
                    </div>
                  )}
                  <button
                    onClick={() => handleLike(product._id)}
                    className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isLiked
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1 dark:text-white">
                    {product.title}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(product.price)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={getAssetUrl(product.seller.avatar)}
                          alt={product.seller.name}
                        />
                        <AvatarFallback className="text-xs">
                          {product.seller.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {product.seller.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDistanceToNow(new Date(product.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Chat Button */}
                  {product.seller._id !== user?._id ? (
                    <Button
                      onClick={() => handleChatWithSeller(product.seller)}
                      className="w-full mt-3"
                      variant="outline"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Nhắn tin cho người bán
                    </Button>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => handleEdit(product)}
                        className="flex-1"
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Sửa
                      </Button>
                      <Button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1"
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
