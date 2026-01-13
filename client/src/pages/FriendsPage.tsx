import { useEffect, useState } from "react";
import { useFriendStore } from "@/store/friendStore";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageCircle, UserMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "@/store/chatStore";
import { toast } from "sonner";

export default function FriendsPage() {
  const { friends, getFriends, removeFriend, loading } = useFriendStore();
  const { selectUser } = useChatStore();
  const navigate = useNavigate();
  const [friendToRemove, setFriendToRemove] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  const handleMessage = (friend: any) => {
    selectUser(friend);
    navigate("/messages");
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;

    try {
      setIsRemoving(true);
      await removeFriend(friendToRemove._id);
      toast.success(`Đã xóa ${friendToRemove.name} khỏi danh sách bạn bè`);
      setFriendToRemove(null);
    } catch (error) {
      toast.error("Không thể xóa bạn bè");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Bạn bè</h1>

      {loading ? (
        <div className="text-center py-8 dark:text-gray-400">
          Đang tải danh sách bạn bè...
        </div>
      ) : friends.length === 0 ? (
        <Card className="p-8 text-center dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có bạn bè. Tìm kiếm người để kết bạn!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <Card
              key={friend._id}
              className="p-4 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={friend.avatar} alt={friend.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-2xl text-white">
                    {friend.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 font-semibold dark:text-white">
                  {friend.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {friend.email}
                </p>
                {friend.isOnline && (
                  <span className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ● Online
                  </span>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMessage(friend)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Nhắn tin
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFriendToRemove(friend)}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Remove Friend Confirmation Dialog */}
      <AlertDialog
        open={!!friendToRemove}
        onOpenChange={() => setFriendToRemove(null)}
      >
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Xóa bạn bè
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              Bạn có chắc muốn xóa{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {friendToRemove?.name}
              </span>{" "}
              khỏi danh sách bạn bè? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isRemoving}
              className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFriend}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRemoving ? "Đang xóa..." : "Xóa bạn bè"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
