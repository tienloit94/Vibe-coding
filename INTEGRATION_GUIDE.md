# Hướng dẫn tích hợp các tính năng mới vào HomePage

## 📝 Các component đã tạo:

### 1. NotificationDropdown ✅
- File: `client/src/components/notifications/NotificationDropdown.tsx`
- Đã tích hợp vào: `MainLayout.tsx`
- Hiển thị: Bell icon với badge số lượng thông báo chưa đọc

### 2. AISettingsDialog ✅
- File: `client/src/components/settings/AISettingsDialog.tsx`
- Đã tích hợp vào: `MainLayout.tsx` (trong dropdown menu profile)
- Chức năng: Nhập Google Gemini API key

### 3. MiniChatPopup ✅
- File: `client/src/components/chat/MiniChatPopup.tsx`
- Cần tích hợp vào: `HomePage.tsx`
- Chức năng: Chat popup nhỏ khi có tin nhắn mới

### 4. TagFriendsSelector ✅
- File: `client/src/components/post/TagFriendsSelector.tsx`
- Cần tích hợp vào: `HomePage.tsx` (trong form tạo post)
- Chức năng: Chọn bạn bè để tag vào post

### 5. UpdatePostDialog ✅
- File: `client/src/components/post/UpdatePostDialog.tsx`
- Cần tích hợp vào: `HomePage.tsx` (menu 3 chấm của post)
- Chức năng: Sửa nội dung và tag của post

---

## 🔧 Tích hợp vào HomePage

### Bước 1: Import components
```typescript
// Thêm vào đầu file HomePage.tsx
import { MoreHorizontal, UserPlus, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TagFriendsSelector from '@/components/post/TagFriendsSelector';
import UpdatePostDialog from '@/components/post/UpdatePostDialog';
import MiniChatPopup from '@/components/chat/MiniChatPopup';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
```

### Bước 2: Thêm state cho tagging và mini chat
```typescript
const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
const [miniChatConversation, setMiniChatConversation] = useState<string | null>(null);
const navigate = useNavigate();
const { conversations } = useChatStore();
```

### Bước 3: Update handleCreatePost để gửi taggedUsers
```typescript
const handleCreatePost = async () => {
  if (!postContent.trim() && selectedImages.length === 0) {
    toast.error('Please write something or add images');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('content', postContent);
    
    // Thêm tagged users
    if (taggedFriends.length > 0) {
      formData.append('taggedUsers', JSON.stringify(taggedFriends));
    }
    
    selectedImages.forEach(image => {
      formData.append('images', image);
    });

    await createPost(formData);
    setPostContent('');
    setSelectedImages([]);
    setImagePreviews([]);
    setTaggedFriends([]); // Reset tags
    toast.success('Post created!');
  } catch (error) {
    toast.error('Failed to create post');
  }
};
```

### Bước 4: Thêm TagFriendsSelector vào form tạo post
Tìm section tạo post và thêm sau Image picker:
```typescript
{/* Tag Friends */}
<TagFriendsSelector
  selectedFriends={taggedFriends}
  onSelect={setTaggedFriends}
/>
```

### Bước 5: Thêm menu Edit/Delete cho mỗi post
Trong phần render posts, thêm dropdown menu (chỉ hiện nếu là post của user hiện tại):
```typescript
{/* Post Header với Edit/Delete menu */}
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-3">
    <Avatar>...</Avatar>
    <div>
      <p className="font-semibold">{post.author.name}</p>
      <p className="text-sm text-gray-500">
        {formatDistanceToNow(new Date(post.createdAt))}
      </p>
    </div>
  </div>
  
  {/* Menu Edit/Delete - Chỉ hiện cho author */}
  {post.author._id === user?._id && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <UpdatePostDialog
            postId={post._id}
            initialContent={post.content}
            initialTaggedUsers={post.taggedUsers?.map(u => u._id) || []}
            onUpdate={fetchFeed}
          />
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDeletePost(post._id)}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa bài viết
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )}
</div>
```

### Bước 6: Hiển thị tagged users trong post
Thêm sau content của post:
```typescript
{/* Tagged Users */}
{post.taggedUsers && post.taggedUsers.length > 0 && (
  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
    <UserPlus className="h-4 w-4" />
    <span>
      Cùng với {post.taggedUsers.map(u => u.name).join(', ')}
    </span>
  </div>
)}
```

### Bước 7: Thêm MiniChatPopup
Thêm cuối file, trước closing div:
```typescript
{/* Mini Chat Popup */}
{miniChatConversation && (
  <MiniChatPopup
    conversationId={miniChatConversation}
    onClose={() => setMiniChatConversation(null)}
  />
)}
```

### Bước 8: Socket listener cho mini chat (optional)
Trong useEffect, thêm socket listener:
```typescript
useEffect(() => {
  const socket = io('http://localhost:5000');
  
  socket.on('message-received', (message) => {
    // Chỉ hiện mini chat nếu đang ở HomePage
    if (window.location.pathname === '/home') {
      setMiniChatConversation(message.conversationId);
    }
  });
  
  return () => {
    socket.disconnect();
  };
}, []);
```

---

## ✅ Checklist hoàn thiện

### Backend (Đã hoàn thành):
- [x] Notification model
- [x] Notification routes & controller
- [x] AI API key management (Gemini)
- [x] Post update endpoint
- [x] Post tagging với notifications
- [x] Socket.io Gemini integration

### Frontend (Hoàn thành 80%):
- [x] NotificationDropdown component
- [x] AISettingsDialog component
- [x] MiniChatPopup component
- [x] TagFriendsSelector component
- [x] UpdatePostDialog component
- [x] postStore.updatePost function
- [x] Post interface với taggedUsers

### Cần làm:
- [ ] Tích hợp TagFriendsSelector vào HomePage
- [ ] Thêm menu Edit/Delete cho posts
- [ ] Hiển thị tagged users trong posts
- [ ] Tích hợp MiniChatPopup
- [ ] Socket listener cho real-time mini chat
- [ ] Test toàn bộ flow

---

## 📱 Demo Flow

### 1. Tạo post với tag bạn bè:
1. Người dùng nhập nội dung post
2. Click "Gắn thẻ bạn bè"
3. Chọn bạn bè từ dropdown
4. Click "Đăng"
5. Người được tag nhận notification

### 2. Edit post:
1. Click 3 chấm ở post của mình
2. Chọn "Chỉnh sửa bài viết"
3. Sửa content hoặc thêm/bớt tag
4. Click "Cập nhật"
5. Người mới được tag nhận notification

### 3. Cấu hình AI:
1. Click avatar → "Cài đặt AI"
2. Nhập Google Gemini API key
3. Click "Lưu API Key"
4. Chat với AI Bot → Nhận response thông minh hơn

### 4. Nhận notification:
1. Khi được tag → Bell icon hiện badge đỏ
2. Click Bell → Xem danh sách notifications
3. Click notification → Redirect đến post
4. Auto mark as read

### 5. Mini chat (khi implement):
1. Đang ở HomePage
2. Có người nhắn tin
3. Popup chat nhỏ hiện góc phải
4. Click để mở rộng chat
5. Minimize hoặc close

---

## 🐛 Debug Tips

### Nếu notification không hiện:
```bash
# Check backend
curl http://localhost:5000/api/notifications -H "Authorization: Bearer YOUR_TOKEN"

# Check store
console.log(useNotificationStore.getState())
```

### Nếu AI không hoạt động:
```bash
# Check API key
curl http://localhost:5000/api/ai/check-key -H "Authorization: Bearer YOUR_TOKEN"

# Test Gemini API
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Nếu tag không work:
- Kiểm tra `taggedUsers` được gửi lên server
- Check console.log trong createPost
- Verify Post model có field `taggedUsers`
- Check notification được tạo trong postController

---

## 🎨 UI/UX Tips

1. **Tagged users**: Hiển thị avatar nhỏ hoặc tên với icon UserPlus
2. **Edit indicator**: Thêm "(đã chỉnh sửa)" nếu updatedAt !== createdAt
3. **Loading states**: Show skeleton cho notifications
4. **Empty states**: Icon + message khi chưa có notifications
5. **Animations**: Fade in/out cho mini chat popup
6. **Badge colors**: Đỏ cho unread, xám cho read

---

## 🚀 Next Steps

1. Tích hợp các component vào HomePage (15-20 phút)
2. Test create post với tags
3. Test edit post
4. Test notifications
5. Cấu hình Gemini API key
6. Test AI responses
7. Implement mini chat socket (nếu cần)

---

**Lưu ý**: Tất cả backend đã sẵn sàng. Chỉ cần tích hợp UI components vào HomePage là xong!
