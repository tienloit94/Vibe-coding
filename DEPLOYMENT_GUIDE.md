# 🚀 Hướng Dẫn Deploy Chat Application

## 📋 Tổng Quan

Ứng dụng chat này gồm:
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + Socket.io
- **Database**: MongoDB
- **Storage**: File uploads (images, avatars)

## 🎯 Các Tùy Chọn Deploy

### 1. Deploy Frontend (Client)

#### Option A: Vercel (Khuyến nghị cho React)

1. **Cài đặt Vercel CLI**:
```bash
npm install -g vercel
```

2. **Build và Deploy**:
```bash
cd client
vercel
```

3. **Cấu hình Environment Variables** trên Vercel Dashboard:
   - `VITE_API_URL`: URL của backend API (ví dụ: https://your-api.onrender.com)

4. **Build Settings** trên Vercel:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### Option B: Netlify

1. **Cài đặt Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build**:
```bash
cd client
npm run build
```

3. **Deploy**:
```bash
netlify deploy --prod --dir=dist
```

4. **Cấu hình**:
   - Thêm file `client/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option C: GitHub Pages

1. **Cài package gh-pages**:
```bash
cd client
npm install --save-dev gh-pages
```

2. **Thêm vào `package.json`**:
```json
{
  "homepage": "https://your-username.github.io/your-repo",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Deploy**:
```bash
npm run deploy
```

### 2. Deploy Backend (Server)

#### Option A: Render (Khuyến nghị - Free tier)

1. **Tạo tài khoản** tại [render.com](https://render.com)

2. **Tạo Web Service mới**:
   - Connect GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

3. **Environment Variables**:
```
PORT=5000
NODE_ENV=production
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secure-secret-key
CLIENT_URL=https://your-frontend-url.vercel.app
OPENAI_API_KEY=your-openai-key (optional)
```

4. **Persistent Disk** (cho uploads):
   - Mount Path: `/opt/render/project/src/uploads`
   - Size: 1GB (free)

#### Option B: Railway

1. **Tạo tài khoản** tại [railway.app](https://railway.app)

2. **New Project** → **Deploy from GitHub**

3. **Environment Variables**: Same as Render

4. **Settings**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

#### Option C: Heroku

1. **Cài Heroku CLI**:
```bash
npm install -g heroku
```

2. **Login và tạo app**:
```bash
heroku login
cd server
heroku create your-app-name
```

3. **Set Environment Variables**:
```bash
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set CLIENT_URL=https://your-frontend.vercel.app
```

4. **Deploy**:
```bash
git push heroku main
```

5. **Procfile** (tạo file mới trong server/):
```
web: node server.js
```

### 3. Deploy Database (MongoDB)

#### Option A: MongoDB Atlas (Khuyến nghị - Free 512MB)

1. **Tạo tài khoản** tại [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Tạo Cluster**:
   - Chọn FREE tier (M0)
   - Chọn region gần nhất
   - Create Cluster

3. **Database Access**:
   - Add Database User
   - Username: `admin`
   - Password: (tạo password mạnh)

4. **Network Access**:
   - Add IP Address: `0.0.0.0/0` (Allow from anywhere)

5. **Connect**:
   - Chọn "Connect your application"
   - Copy connection string
   - Replace `<password>` với password của bạn
   - Dán vào `MONGO_URI` environment variable

#### Option B: MongoDB Cloud (DigitalOcean)

- Managed MongoDB starting at $15/month
- Better performance for production

### 4. Deploy File Storage (Uploads)

#### Option A: Cloudinary (Khuyến nghị)

1. **Tạo tài khoản** tại [cloudinary.com](https://cloudinary.com)

2. **Cài package**:
```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

3. **Update upload middleware** (`server/middleware/upload.js`):
```javascript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-app',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf'],
  },
});

export const upload = multer({ storage });
```

4. **Environment Variables**:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Option B: AWS S3

- Mạnh mẽ hơn nhưng phức tạp hơn
- Chi phí theo usage

## 🔧 Chuẩn Bị Deploy

### 1. Tạo các file cần thiết

**`server/.env.production`**:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app
JWT_SECRET=your-super-secure-secret-key-for-production
CLIENT_URL=https://your-frontend-domain.vercel.app
OPENAI_API_KEY=your-openai-api-key
```

**`client/.env.production`**:
```env
VITE_API_URL=https://your-backend-domain.onrender.com
```

### 2. Update CORS settings

**`server/server.js`**:
```javascript
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      'https://your-production-domain.vercel.app',
    ],
    credentials: true,
  })
);
```

**`server/config/socket.js`**:
```javascript
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      'https://your-production-domain.vercel.app',
    ],
    credentials: true,
  },
});
```

### 3. Security Checklist

- [ ] Đổi `JWT_SECRET` thành giá trị ngẫu nhiên mạnh
- [ ] Sử dụng HTTPS cho production
- [ ] Enable rate limiting
- [ ] Validate tất cả inputs
- [ ] Sanitize data trước khi lưu DB
- [ ] Không commit file `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Compress responses (gzip)
- [ ] Use helmet.js cho security headers

### 4. Performance Optimization

**Backend**:
```javascript
// Add to server.js
import compression from 'compression';
import helmet from 'helmet';

app.use(helmet());
app.use(compression());
```

**Frontend**:
- Build với `npm run build`
- Enable lazy loading cho routes
- Optimize images trước khi upload
- Use CDN cho static assets

## 📝 Deployment Steps (Recommended Stack)

### Quick Deploy (15 phút)

1. **Database** - MongoDB Atlas:
   ```bash
   # Tạo cluster → Copy connection string
   ```

2. **Backend** - Render:
   ```bash
   # Connect GitHub → Set env vars → Deploy
   # URL: https://your-app.onrender.com
   ```

3. **Frontend** - Vercel:
   ```bash
   cd client
   vercel
   # Set VITE_API_URL=https://your-app.onrender.com
   ```

4. **Test**:
   - Open Vercel URL
   - Register new account
   - Test chat, posts, notifications
   - Test on mobile

## 🐛 Common Issues

### Issue 1: CORS Error
**Solution**: Update `CLIENT_URL` in backend env vars

### Issue 2: 502 Bad Gateway
**Solution**: 
- Check if backend is running
- Verify MongoDB connection
- Check logs

### Issue 3: WebSocket connection failed
**Solution**:
- Ensure server supports WebSocket
- Check CORS settings for Socket.io
- Verify SSL certificate

### Issue 4: Images not loading
**Solution**:
- Use absolute URLs
- Setup Cloudinary for file storage
- Check CORS for image requests

### Issue 5: Database connection timeout
**Solution**:
- Whitelist IP in MongoDB Atlas
- Check connection string format
- Verify credentials

## 🔍 Monitoring & Logs

### Render/Railway:
- View logs in dashboard
- Set up monitoring alerts
- Check resource usage

### Vercel:
- View analytics
- Check function logs
- Monitor performance

## 💰 Cost Estimation (Free Tier)

- **Frontend (Vercel)**: FREE
- **Backend (Render)**: FREE (sleep after 15min inactive)
- **Database (MongoDB Atlas)**: FREE (512MB)
- **Storage (Cloudinary)**: FREE (10GB/month)
- **Total**: **$0/month**

## 🚀 Upgrade Path (Paid)

- **Render**: $7/month (always-on)
- **MongoDB Atlas**: $9/month (2GB)
- **Cloudinary**: $99/month (unlimited)
- **Total**: ~$15-100/month depending on usage

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Guide](https://www.mongodb.com/docs/atlas/)
- [Socket.io Deployment](https://socket.io/docs/v4/deployment/)

## 🎉 Post-Deployment

1. **Setup Domain** (optional):
   - Buy domain from Namecheap/GoDaddy
   - Point to Vercel/Render
   - Setup SSL certificate (auto)

2. **Setup Analytics**:
   - Google Analytics
   - Vercel Analytics
   - Error tracking (Sentry)

3. **Backup Strategy**:
   - MongoDB automatic backups
   - Code versioning (Git)
   - Export user data regularly

4. **Monitoring**:
   - Uptime monitoring (UptimeRobot)
   - Performance (Lighthouse)
   - Error logging (Sentry/LogRocket)

---

**Need help?** Check the issues on GitHub or contact support.

**Ready to deploy?** Follow the Quick Deploy steps above! 🚀
