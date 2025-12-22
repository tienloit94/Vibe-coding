# 🍃 MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - RECOMMENDED) ⭐

**Ưu điểm:**
- ✅ Miễn phí (Free tier 512MB)
- ✅ Không cần cài đặt
- ✅ Setup trong 5 phút
- ✅ Có thể truy cập từ mọi nơi

### Các bước setup MongoDB Atlas:

#### 1. Tạo tài khoản
- Truy cập: https://www.mongodb.com/cloud/atlas/register
- Đăng ký bằng email hoặc Google

#### 2. Tạo Cluster (Database)
1. Click **"Build a Database"** hoặc **"Create"**
2. Chọn **FREE** tier (M0 Sandbox)
3. Chọn **Provider**: AWS
4. Chọn **Region**: Singapore hoặc gần nhất (cho tốc độ)
5. Click **"Create Cluster"** (đợi 1-3 phút)

#### 3. Tạo Database User
1. Bên trái menu, click **"Database Access"**
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `chatapp` (hoặc tên bạn muốn)
5. **Password**: Tạo password mạnh hoặc click **"Autogenerate Secure Password"**
   - **LƯU Ý**: Copy và lưu password này!
6. **Database User Privileges**: Chọn **"Read and write to any database"**
7. Click **"Add User"**

#### 4. Whitelist IP Address
1. Bên trái menu, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"ALLOW ACCESS FROM ANYWHERE"** (cho dev/testing)
   - Hoặc click **"Add Current IP Address"** (an toàn hơn)
4. Click **"Confirm"**

#### 5. Lấy Connection String
1. Quay lại **"Database"** (menu bên trái)
2. Click button **"Connect"** trên cluster của bạn
3. Chọn **"Drivers"**
4. Chọn **Driver**: Node.js, **Version**: 4.1 or later
5. Copy **Connection String**, sẽ giống như:
   ```
   mongodb+srv://chatapp:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### 6. Update file .env
Mở file `d:\TestAI\server\.env` và thay đổi:

```env
# Thay thế <password> bằng password thật của bạn
MONGO_URI=mongodb+srv://chatapp:<password>@cluster0.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority
```

**Lưu ý:**
- Thay `<password>` bằng password của user bạn đã tạo
- Thêm `/chat-app` trước dấu `?` để đặt tên database

**Ví dụ:**
```env
MONGO_URI=mongodb+srv://chatapp:MyP@ssw0rd@cluster0.abc123.mongodb.net/chat-app?retryWrites=true&w=majority
```

---

## Option 2: MongoDB Local (Cài đặt trên máy)

### Windows Installation:

#### 1. Download MongoDB
- Truy cập: https://www.mongodb.com/try/download/community
- Chọn phiên bản **Windows x64**
- Download file `.msi`

#### 2. Cài đặt
1. Chạy file `.msi` đã tải
2. Chọn **"Complete"** installation
3. Tick **"Install MongoDB as a Service"**
4. Tick **"Run service as Network Service user"**
5. **KHÔNG** tick "Install MongoDB Compass" (nếu không cần GUI)
6. Click **"Install"**

#### 3. Khởi động MongoDB Service
Mở PowerShell **với quyền Administrator** và chạy:

```powershell
net start MongoDB
```

#### 4. Verify MongoDB đang chạy
```powershell
mongosh --version
mongod --version
```

#### 5. Update file .env
File `d:\TestAI\server\.env`:

```env
MONGO_URI=mongodb://localhost:27017/chat-app
```

### Troubleshooting Local MongoDB:

**Lỗi "MongoDB service not found":**
```powershell
# Tạo service thủ công
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg" --install
```

**Lỗi "Access denied":**
- Chạy PowerShell với quyền Administrator

**MongoDB không start:**
```powershell
# Xem log
Get-EventLog -LogName Application -Source MongoDB -Newest 10
```

---

## Verify Connection

Sau khi setup xong, restart backend:

```powershell
# Stop server (Ctrl+C trong terminal backend)
# Hoặc trong terminal mới:
cd d:\TestAI\server
npm run dev
```

**Kết quả mong đợi:**
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net (hoặc localhost)
✅ Socket.io initialized
╔════════════════════════════════════════╗
║   🚀 Server running on port 5000     ║
║   📡 Environment: development        ║
║   🔗 URL: http://localhost:5000       ║
╚════════════════════════════════════════╝
```

---

## Quick Start (Recommended: MongoDB Atlas)

### 1-Minute Setup:

1. **Tạo tài khoản Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Tạo FREE cluster** (M0)
3. **Tạo user** với password
4. **Allow IP**: 0.0.0.0/0 (all IPs)
5. **Copy connection string**
6. **Update `.env`**:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority
   ```
7. **Restart server**: `npm run dev`

✅ Done!

---

## Cần giúp đỡ?

**MongoDB Atlas Documentation:**
- https://www.mongodb.com/docs/atlas/getting-started/

**MongoDB Community Forums:**
- https://www.mongodb.com/community/forums/

**Hoặc liên hệ tôi để được support!**
