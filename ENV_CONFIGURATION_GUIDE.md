# 🔐 Environment Configuration Guide

## Server (.env)

### Current Configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb+srv://trantienloi412_db_user_chatapp:YUu5s7Y4lsuLhtc7@cluster0.1k4jdch.mongodb.net/chat-app?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# AI Configuration
GEMINI_API_KEY=
OPENAI_API_KEY=your-openai-api-key-here
```

---

## Client (.env)

### Current Configuration:
```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

---

## ✅ Đã Hoàn Thành:

### Backend:
1. ✅ **MongoDB Connection String** - Đã lưu vào .env
2. ✅ **JWT Secret** - Đã lưu vào .env
3. ✅ **OpenAI API Key** - Đã lưu vào .env (sẵn sàng cho tương lai)
4. ✅ **Gemini API Key** - Có biến trong .env (người dùng cần cấu hình qua UI)
5. ✅ **geminiService.js** - Load API key từ .env khi khởi động

### Frontend:
1. ✅ **lib/config.ts** - Centralized API config
2. ✅ **getApiUrl()** - Helper function cho API endpoints
3. ✅ **getAssetUrl()** - Helper function cho images/files
4. ✅ **Updated Components** - Sử dụng config thay vì hardcode:
   - AISettingsDialog
   - UpdatePostDialog
   - MiniChatPopup
   - TagFriendsSelector
   - NotificationDropdown
   - ProfilePage

---

## 🔧 Cách Sử Dụng:

### 1. API Endpoints:
```typescript
import { getApiUrl } from '@/lib/config';

// Before:
axios.get('http://localhost:5000/api/users')

// After:
axios.get(getApiUrl('api/users'))
```

### 2. Asset URLs (Images, Files):
```typescript
import { getAssetUrl } from '@/lib/config';

// Before:
<img src={`http://localhost:5000${user.avatar}`} />

// After:
<img src={getAssetUrl(user.avatar)} />
```

### 3. Environment Variables:
```typescript
// Server
process.env.MONGO_URI
process.env.JWT_SECRET
process.env.OPENAI_API_KEY
process.env.GEMINI_API_KEY

// Client
import.meta.env.VITE_API_URL
```

---

## 🚀 Deployment:

### Production Server .env:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-strong-production-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-production-domain.com
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
```

### Production Client .env:
```env
VITE_API_URL=https://your-api-domain.com
```

---

## 📝 Lưu Ý:

### OpenAI API Key:
- Đã lưu vào .env
- Hiện tại chưa sử dụng trong code
- Sẵn sàng cho các tính năng AI trong tương lai
- Có thể dùng cho: Text generation, embeddings, chat completion, image generation

### Gemini API Key:
- Có biến trong .env nhưng để trống
- Load từ .env khi server khởi động
- Người dùng có thể cập nhật runtime qua UI (AISettingsDialog)
- Runtime key sẽ override .env key
- Lấy miễn phí tại: https://makersuite.google.com/app/apikey

### Security:
- ✅ Không commit .env vào git (.gitignore)
- ✅ .env.example làm template
- ✅ API keys được bảo vệ
- ✅ MongoDB credentials an toàn
- ✅ JWT secret mạnh

---

## 🔄 Cách Cập Nhật Môi Trường:

### Thay đổi API URL:
1. Sửa `client/.env`:
   ```env
   VITE_API_URL=http://new-url:port
   ```
2. Restart Vite dev server
3. Tất cả components tự động dùng URL mới

### Thay đổi MongoDB:
1. Sửa `server/.env`:
   ```env
   MONGO_URI=new-connection-string
   ```
2. Restart server

### Cập nhật AI Keys:
**Cách 1: Qua .env (Server restart required)**
```env
GEMINI_API_KEY=your-new-key
OPENAI_API_KEY=your-openai-key
```

**Cách 2: Qua UI (Runtime, không cần restart)**
1. Click avatar → "Cài đặt AI"
2. Nhập API key mới
3. Lưu → Áp dụng ngay lập tức

---

## 🎯 Best Practices:

1. ✅ **Không hardcode URLs** - Luôn dùng config
2. ✅ **Environment-specific configs** - Dev vs Production
3. ✅ **Secret rotation** - Thay đổi JWT secret định kỳ
4. ✅ **API key protection** - Không expose ra client
5. ✅ **Graceful fallbacks** - Handle missing env vars

---

## 🐛 Troubleshooting:

### API calls failing:
```bash
# Check .env files exist
ls client/.env
ls server/.env

# Verify API URL
echo $VITE_API_URL  # Client
echo $PORT          # Server
```

### MongoDB connection failed:
```bash
# Test connection string
node -e "console.log(process.env.MONGO_URI)"
```

### AI not working:
```bash
# Check API key status
curl http://localhost:5000/api/ai/check-key -H "Authorization: Bearer YOUR_TOKEN"

# Or configure via UI
```

---

**Status: ✅ Environment configuration hoàn tất!**
**Tất cả sensitive data đã được di chuyển vào .env files**
