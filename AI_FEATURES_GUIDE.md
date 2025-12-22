# Hướng dẫn cấu hình và sử dụng tính năng mới

## 🤖 Cấu hình AI API Key (OpenAI ChatGPT)

### Bước 1: Lấy API Key
1. Truy cập: https://platform.openai.com/api-keys
2. Đăng nhập với OpenAI Account
3. Click "Create new secret key"
4. Copy API key (bắt đầu với sk-...)

### Bước 2: Cấu hình trong app
**Cách 1: Qua .env (khuyến nghị)**
```env
# server/.env
OPENAI_API_KEY=sk-proj-your-key-here
```

**Cách 2: Qua UI**
```typescript
// Click Avatar → "Cài đặt AI" → Nhập key → Lưu
```

### Backend đã setup:
- ✅ Route: `POST /api/ai/set-key` - Cập nhật API key
- ✅ Route: `GET /api/ai/check-key` - Kiểm tra đã có key chưa
- ✅ AI Bot tự động dùng ChatGPT (GPT-3.5 Turbo) nếu có key
- ✅ Fallback về simple AI nếu chưa có key

### Model: GPT-3.5 Turbo
- Max tokens: 200
- Temperature: 0.7
- Hỗ trợ tiếng Việt tốt
- Trả lời thông minh, tự nhiên

---

## ✏️ Cập nhật & Xóa bài đăng

### Backend Routes:
```javascript
PUT /api/posts/:postId - Update post
DELETE /api/posts/:postId - Delete post (đã có)
```

### Frontend cần thêm:
```typescript
// Update post
await postStore.updatePost(postId, {
  content: 'New content',
  taggedUsers: ['userId1', 'userId2']
});

// Delete post  
await postStore.deletePost(postId);
```

---

## 🏷️ Gắn thẻ bạn bè trong bài đăng

### Backend:
- ✅ Post model có field `taggedUsers`
- ✅ Tự động gửi notification khi được tag
- ✅ API `POST /api/posts` nhận `taggedUsers` array

### Frontend cần làm:
1. Thêm UI chọn bạn bè để tag
2. Gửi `taggedUsers` khi tạo/edit post
3. Hiển thị danh sách người được tag

---

## 🔔 Thông báo Dropdown

### Đã tạo:
- ✅ `NotificationDropdown.tsx` component
- ✅ `notificationStore.ts` - State management
- ✅ Backend: Notification model + routes
- ✅ Auto poll mỗi 30s

### Cách dùng:
```typescript
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

// Trong MainLayout
<NotificationDropdown />
```

### Types của notification:
- `friend_request` - Lời mời kết bạn
- `friend_accepted` - Chấp nhận kết bạn
- `post_tag` - Được tag trong bài viết
- `post_like` - Like bài viết
- `post_comment` - Comment bài viết
- `message` - Tin nhắn mới

---

## 💬 Mini Chat Popup (Cần implement)

### UI Design:
- Popup nhỏ góc dưới phải màn hình
- Hiện khi có tin nhắn mới
- Click để mở rộng chat
- Có thể minimize/close

### Component structure:
```typescript
// MiniChatPopup.tsx
- Show when new message arrives
- List of active chats
- Click to expand full chat
- Minimize button
- Close button
```

### Socket integration:
```typescript
socket.on('message-received', (message) => {
  // Show mini popup if not in /messages
  if (window.location.pathname !== '/messages') {
    showMiniChat(message);
  }
});
```

---

## 📦 Files đã tạo

### Backend:
1. `models/Notification.js` - Notification schema
2. `controllers/notificationController.js` - CRUD notifications
3. `controllers/aiController.js` - AI API key management
4. `routes/notificationRoutes.js` - Notification endpoints
5. `routes/aiRoutes.js` - AI configuration endpoints
6. `utils/geminiService.js` - Google Gemini AI integration
7. Updated `models/Post.js` - Added taggedUsers field
8. Updated `controllers/postController.js` - Update post + notifications
9. Updated `config/socket.js` - Gemini AI integration

### Frontend:
1. `store/notificationStore.ts` - Notification state
2. `components/notifications/NotificationDropdown.tsx` - Notification UI

---

## 🚀 Deployment Checklist

### Backend:
- [x] Notification system
- [x] AI API integration
- [x] Update/Delete post
- [x] Tag friends
- [ ] Mini chat socket events
- [ ] Environment variables for API keys

### Frontend:
- [x] Notification dropdown
- [x] Notification store
- [ ] AI settings page
- [ ] Tag friends UI in create post
- [ ] Edit post modal
- [ ] Mini chat popup
- [ ] Update postStore with edit/tag functions

---

## 📝 TODO List

### High Priority:
1. ⏳ Tạo Mini Chat Popup component
2. ⏳ Tạo AI Settings page để nhập API key
3. ⏳ Thêm UI tag bạn bè khi tạo post
4. ⏳ Thêm Edit Post modal
5. ⏳ Update postStore với updatePost function

### Medium Priority:
6. ⏳ Socket event cho notifications real-time
7. ⏳ Notification sound
8. ⏳ Mark as read on click
9. ⏳ Delete notification animation

### Low Priority:
10. ⏳ Notification preferences
11. ⏳ Email notifications
12. ⏳ Push notifications
13. ⏳ Notification grouping

---

## 🔧 Cách test

### Test Notifications:
1. User A tag User B trong post
2. User B kiểm tra notification bell (có badge đỏ)
3. Click bell → Xem dropdown
4. Click notification → Redirect đến post
5. Notification được đánh dấu đã đọc

### Test AI với Gemini:
1. Lấy API key từ Google AI Studio
2. POST /api/ai/set-key với API key
3. Chat với AI Assistant
4. AI sẽ trả lời thông minh hơn (dùng Gemini)

### Test Update Post:
1. Tạo bài post
2. Click Edit (cần thêm button)
3. Sửa content
4. Save → Post được update

---

## 💡 Tips

- API key Gemini free có giới hạn: 60 requests/minute
- Notifications nên cache để giảm load
- Mini chat popup nên debounce để không spam
- Tag friends nên có autocomplete search
- Socket events cho notifications real-time

---

**Status: Backend hoàn tất 80%, Frontend cần implement UI components**
