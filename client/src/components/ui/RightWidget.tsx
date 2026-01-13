import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  UserPlus,
  Hash,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { useFriendStore } from "@/store/friendStore";
import { useProductStore, Product } from "@/store/productStore";
import { toast } from "sonner";
import axios from "axios";
import { getApiUrl, getAssetUrl } from "@/lib/config";

interface TrendingTopic {
  tag: string;
  count: number;
}

export default function RightWidget() {
  const { friends, onlineUsers, getFriends } = useFriendStore();
  const { fetchFeaturedProducts } = useProductStore();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    getFriends();
    fetchSuggestions();
    loadFeaturedProducts();
  }, [getFriends]);

  const loadFeaturedProducts = async () => {
    try {
      const products = await fetchFeaturedProducts(5);
      setFeaturedProducts(products);
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(getApiUrl("api/friends/suggestions"), {
        withCredentials: true,
      });
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };

  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevProduct = () => {
    setCurrentProductIndex((prev) =>
      prev === 0 ? featuredProducts.length - 1 : prev - 1
    );
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await axios.post(
        getApiUrl(`api/friends/request/${userId}`),
        {},
        { withCredentials: true }
      );
      toast.success("Đã gửi lời mời kết bạn");
      setSuggestions(suggestions.filter((s) => s._id !== userId));
    } catch (error) {
      toast.error("Không thể gửi lời mời");
    }
  };

  const onlineFriendsCount = friends.filter((f) => onlineUsers[f._id]).length;

  return (
    <aside className="hidden xl:flex flex-col w-80 space-y-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pr-2">
      {/* Bạn bè đang online */}
      <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-200 flex items-center">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Bạn bè ({friends.length})
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {friends.length > 0 ? (
            friends.slice(0, 10).map((friend) => {
              const isOnline = onlineUsers[friend._id];
              return (
                <div
                  key={friend._id}
                  className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 cursor-pointer transition"
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                        {friend.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium dark:text-white truncate block">
                      {friend.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isOnline ? "Đang hoạt động" : "Offline"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Chưa có bạn bè
            </p>
          )}
        </div>
      </Card>

      {/* Gợi ý kết bạn */}
      {suggestions.length > 0 && (
        <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-200 flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Gợi ý kết bạn
          </h3>
          <div className="space-y-3">
            {suggestions.slice(0, 4).map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.mutualFriends || 0} bạn chung
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddFriend(user._id)}
                  className="ml-2 flex-shrink-0 text-xs"
                >
                  Kết bạn
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sản phẩm nổi bật - Product Slider */}
      {featuredProducts.length > 0 && (
        <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-green-500" />
              Sản phẩm nổi bật
            </h3>
            <Link to="/marketplace">
              <Button variant="ghost" size="sm" className="text-xs">
                Xem tất cả
              </Button>
            </Link>
          </div>

          <div className="relative">
            {/* Product Card */}
            <div className="overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {featuredProducts[currentProductIndex].images[0] ? (
                  <img
                    src={getAssetUrl(
                      featuredProducts[currentProductIndex].images[0]
                    )}
                    alt={featuredProducts[currentProductIndex].title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    Không có ảnh
                  </div>
                )}
              </div>

              <div className="p-3">
                <h4 className="font-semibold text-sm mb-1 line-clamp-1 dark:text-white">
                  {featuredProducts[currentProductIndex].title}
                </h4>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(featuredProducts[currentProductIndex].price)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {featuredProducts[currentProductIndex].description}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={getAssetUrl(
                        featuredProducts[currentProductIndex].seller.avatar
                      )}
                      alt={featuredProducts[currentProductIndex].seller.name}
                    />
                    <AvatarFallback className="text-xs">
                      {featuredProducts[currentProductIndex].seller.name
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {featuredProducts[currentProductIndex].seller.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            {featuredProducts.length > 1 && (
              <>
                <button
                  onClick={prevProduct}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 shadow-md hover:bg-white dark:hover:bg-gray-700 transition"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                </button>
                <button
                  onClick={nextProduct}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 shadow-md hover:bg-white dark:hover:bg-gray-700 transition"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                </button>

                {/* Dots Indicator */}
                <div className="flex justify-center gap-1 mt-2">
                  {featuredProducts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentProductIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentProductIndex
                          ? "w-4 bg-blue-600 dark:bg-blue-400"
                          : "w-1.5 bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Footer */}
      <div className="px-4 py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2026 Social Network • Privacy • Terms
        </p>
      </div>
    </aside>
  );
}
