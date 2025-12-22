# 🚀 Hướng Dẫn Deploy Từng Bước

## 📋 Checklist Trước Khi Deploy

- [x] Build client thành công
- [x] Tạo file .env.production
- [x] Tạo file .gitignore
- [ ] Tạo MongoDB Atlas account
- [ ] Deploy backend lên Render
- [ ] Deploy frontend lên Vercel
- [ ] Test ứng dụng

---

## BƯỚC 1: Tạo MongoDB Database (5 phút)

### 1.1 Tạo Account MongoDB Atlas

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký với email của bạn (hoặc Google/GitHub)
3. Chọn FREE tier

### 1.2 Tạo Cluster

1. Click **"Build a Database"**
2. Chọn **FREE (M0)** tier
3. Chọn Cloud Provider: **AWS**
4. Region: **Singapore** (hoặc gần bạn nhất)
5. Cluster Name: `ChatApp` (hoặc tên bạn thích)
6. Click **"Create"**

### 1.3 Tạo Database User

1. Trong tab **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Username: `chatapp_admin`
4. Password: `ChatApp123!@#` (lưu lại password này)
5. Database User Privileges: **"Atlas admin"**
6. Click **"Add User"**

### 1.4 Whitelist IP Address

1. Tab **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.5 Lấy Connection String

1. Tab **Deployment** → **Database**
2. Click **"Connect"**
3. Chọn **"Connect your application"**
4. Copy connection string, nó sẽ giống như:
   ```
   mongodb+srv://chatapp_admin:<password>@chatapp.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Thay `<password>` bằng `ChatApp123!@#`
6. Thêm tên database sau `.net/`: `chat-app`
   
   **Kết quả cuối cùng:**
   ```
   mongodb+srv://chatapp_admin:ChatApp123!@#@chatapp.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority
   ```

---

## BƯỚC 2: Deploy Backend lên Render (10 phút)

### 2.1 Chuẩn bị GitHub Repository

1. **Tạo GitHub Repository mới**:
   - Truy cập: https://github.com/new
   - Repository name: `chat-app`
   - Public hoặc Private (tùy bạn)
   - Click **"Create repository"**

2. **Push code lên GitHub**:
   ```bash
   # Trong folder D:\TestAI
   git init
   git add .
   git commit -m "Initial commit - Chat App"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/chat-app.git
   git push -u origin main
   ```

### 2.2 Deploy trên Render

1. **Tạo Account Render**:
   - Truy cập: https://dashboard.render.com/register
   - Đăng ký bằng GitHub account

2. **Tạo Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Click **"Connect GitHub"** → Authorize Render
   - Chọn repository `chat-app`
   - Click **"Connect"**

3. **Cấu hình Service**:
   - **Name**: `chat-app-backend` (hoặc tên khác)
   - **Region**: Singapore (hoặc gần bạn)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Environment Variables** (Click "Advanced"):
   
   Thêm các biến sau:
   ```
   Key: PORT
   Value: 5000
   
   Key: NODE_ENV
   Value: production
   
   Key: MONGO_URI
   Value: mongodb+srv://chatapp_admin:ChatApp123!@#@chatapp.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority
   
   Key: JWT_SECRET
   Value: 8h9j2k3l4m5n6p7q8r9s0t1u2v3w4x5y6z7a8b9c
   
   Key: JWT_EXPIRES_IN
   Value: 7d
   
   Key: CLIENT_URL
   Value: https://chat-app-frontend.vercel.app (tạm thời, sẽ update sau)
   ```

5. **Click "Create Web Service"**

6. **Đợi deploy** (3-5 phút)
   - Xem logs trong dashboard
   - Khi thấy "Server is running" là thành công
   - Copy URL của backend (ví dụ: `https://chat-app-backend.onrender.com`)

---

## BƯỚC 3: Deploy Frontend lên Vercel (5 phút)

### 3.1 Cài Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Update Environment Variable

1. **Mở file** `client\.env.production`
2. **Thay URL** backend:
   ```env
   VITE_API_URL=https://chat-app-backend.onrender.com
   ```
   (Thay bằng URL Render của bạn)

### 3.3 Commit và Push

```bash
git add client\.env.production
git commit -m "Update production API URL"
git push
```

### 3.4 Deploy lên Vercel

```bash
# Trong folder D:\TestAI
cd client
vercel login
# Đăng nhập bằng email hoặc GitHub

vercel
# Chọn: Set up and deploy "~/client"? Y
# Which scope? Chọn account của bạn
# Link to existing project? N
# What's your project's name? chat-app-frontend
# In which directory is your code located? ./
# Want to override the settings? N

# Đợi deploy xong, sẽ có URL như:
# https://chat-app-frontend-xxx.vercel.app
```

### 3.5 Deploy Production

```bash
vercel --prod
# Copy URL production (ví dụ: https://chat-app-frontend.vercel.app)
```

---

## BƯỚC 4: Cập Nhật Lại Backend CORS (2 phút)

### 4.1 Update CLIENT_URL trên Render

1. Vào Render Dashboard
2. Chọn service `chat-app-backend`
3. Tab **Environment**
4. Edit biến `CLIENT_URL`
5. Đổi thành URL Vercel của bạn: `https://chat-app-frontend.vercel.app`
6. Click **"Save Changes"**
7. Render sẽ tự động redeploy

---

## BƯỚC 5: Test Ứng Dụng

### 5.1 Kiểm tra Backend

1. Mở: `https://chat-app-backend.onrender.com`
2. Nếu thấy JSON: `{"success":true,"message":"Chat API is running"}` → OK!

### 5.2 Kiểm tra Frontend

1. Mở: `https://chat-app-frontend.vercel.app`
2. Test các chức năng:
   - [ ] Register account mới
   - [ ] Login
   - [ ] Gửi tin nhắn
   - [ ] Tạo post
   - [ ] Upload ảnh
   - [ ] Video call (nếu có)
   - [ ] Notifications

---

## ✅ Hoàn Tất!

**URLs của bạn:**
- 🌐 Frontend: `https://chat-app-frontend.vercel.app`
- ⚙️ Backend: `https://chat-app-backend.onrender.com`
- 🗄️ Database: MongoDB Atlas

**Lưu ý:**
- Render FREE tier sẽ sleep sau 15 phút không hoạt động
- Lần đầu truy cập sau khi sleep mất 30-50 giây để wake up
- Để luôn active, upgrade lên $7/month

---

## 🐛 Troubleshooting

### Lỗi: CORS Error
**Giải pháp**: Kiểm tra CLIENT_URL trong Render environment variables

### Lỗi: Database connection failed
**Giải pháp**: 
- Check MONGO_URI có đúng không
- Check IP có whitelisted không (0.0.0.0/0)
- Check username/password

### Lỗi: 502 Bad Gateway
**Giải pháp**: 
- Đợi backend wake up (30 giây)
- Check logs trong Render dashboard

### Lỗi: Images not loading
**Giải pháp**: 
- Cần setup Cloudinary cho production
- Xem DEPLOYMENT_GUIDE.md

---

**Cần trợ giúp?** Inbox mình!
