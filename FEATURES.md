# 🌐 Social Network Application - Tổng hợp tính năng

Ứng dụng mạng xã hội toàn diện với chat real-time, posts, stories, groups và AI chatbot.

---

## 🚀 Tech Stack

### Backend

- **Node.js & Express.js** - REST API server
- **MongoDB & Mongoose** - NoSQL database với ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication với HttpOnly cookies
- **Multer** - File upload middleware (50MB limit)
- **Gemini AI** - Google AI integration cho chatbot

### Frontend

- **React 18 + TypeScript** - Component-based UI
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful components (Radix UI primitives)
- **Zustand** - Lightweight state management
- **React Router v6** - Client-side routing
- **Socket.io-client** - WebSocket client
- **Axios** - HTTP client
- **date-fns** - Date formatting (vi locale)
- **Lucide React** - Modern icon library

---

## 📋 Tính năng đầy đủ

### 1. 👤 Xác thực & Quản lý tài khoản

#### Đăng ký/Đăng nhập

- Email và password validation
- JWT tokens lưu trong HttpOnly cookies
- Auto-refresh tokens
- Remember me functionality

#### Quản lý Profile

- Upload avatar (auto-resize)
- Cập nhật thông tin: Name, Bio, Location, Website
- Thay đổi mật khẩu
- Online/Offline status real-time
- Last seen timestamp

#### Privacy & Security

- Block users (2-way blocking)
- Unblock users
- Privacy settings
- Account deactivation

---

### 2. 💬 Chat Real-time (1-on-1)

#### Messaging Features

- **Send messages:** Text, images, videos, files, audio
- **Real-time delivery:** Socket.io instant updates
- **Typing indicators:** "Đang gõ..." animation
- **Read receipts:** ✓✓ Đã xem/Chưa xem
- **Message status:** Đang gửi → Đã gửi → Lỗi
- **Timestamps:** Relative time (vài giây trước, 5 phút trước...)

#### Message Types

- **Text:** Plain text với emoji support
- **Images:** JPEG, PNG, GIF (inline preview, click to expand)
- **Videos:** MP4, AVI, MOV, WMV, FLV, MKV, WebM (player with controls)
- **Files:** PDF, DOC, DOCX, TXT, ZIP (download button)
- **Audio:** MP3, WAV (audio player)

#### Message Interactions

- **Emoji reactions:** ❤️😂😮😢😡👍 (6 quick reactions)
- **Delete own messages:** Xóa tin nhắn đã gửi
- **Copy text:** Right-click menu
- **Forward messages:** (Coming soon)

#### Chat UI

- **Conversation list:** Last message preview, unread count
- **Search conversations:** Filter by name/email
- **User status:** Online (green dot), Offline (gray)
- **Chat header:** Avatar, name, status, call buttons
- **Emoji picker:** 160+ emojis in popup
- **File upload:** Drag-drop or click paperclip icon
- **Auto-scroll:** To latest message
- **Infinite scroll:** Load older messages

---

### 3. 📞 Voice & Video Calls

#### WebRTC Features

- **Voice calls:** Audio-only với high quality
- **Video calls:** Camera stream với HD quality
- **Peer-to-peer:** No server relay (low latency)

#### Call Controls

- **Mute/Unmute:** Toggle microphone
- **Video On/Off:** Toggle camera
- **End call:** Hang up button
- **Accept/Decline:** Incoming call notifications

#### Call UI

- **Picture-in-picture:** Local video thumbnail
- **Full-screen:** Remote video maximized
- **Call duration:** Timer display
- **Connection status:** Connecting/Connected/Disconnected
- **Ringtone:** Audio feedback

---

### 4. 📝 Posts & Newsfeed

#### Create Posts

- **Text content:** Rich text với emoji
- **Media upload:**
  - Multiple images (tối đa 4, grid layout)
  - Single video (player với controls)
  - Auto-compression (images)
- **Tag users:** @ mention friends
- **Visibility:**
  - 🌐 Public (mọi người)
  - 👥 Friends (chỉ bạn bè)
  - 🔒 Private (chỉ mình tôi)
- **Post to group:** Chọn group destination
- **Anonymous posting:** Ẩn tên trong groups

#### Post Interactions

- **Reactions:** 8 loại cảm xúc
  - ❤️ Like (Love)
  - 😂 Haha (Funny)
  - 😮 Wow (Surprised)
  - 😢 Sad
  - 😡 Angry
  - 👍 Thumbs Up
  - 🔥 Fire (Hot/Trending)
  - 🎉 Party (Celebrate)
- **Comments:**
  - Nested replies (2-level threading)
  - Emoji reactions on comments
  - Edit/Delete own comments
  - Tag users in comments
- **Shares:** Repost với optional message
- **Saves:** Bookmark posts (view in Saved section)

#### Newsfeed Algorithm

- Posts từ friends
- Posts từ groups you joined
- Public posts (discover)
- Sort by: Latest/Popular/Top
- Infinite scroll loading
- Refresh to load new

#### Content Features

- **Image gallery:** Swipe/Click through multiple images
- **Video player:** Controls, fullscreen, volume
- **Link preview:** Auto-embed URLs
- **Content moderation:** Bad words filter
- **Report posts:** Flag inappropriate content

---

### 5. 📖 Stories (24-hour ephemeral posts)

#### Create Story

- **Upload media:** Image hoặc video (50MB max)
- **Text overlay:** Thêm text caption
- **Background color:** Chọn màu nền (cho text-only)
- **Auto-expiration:** MongoDB TTL tự động xóa sau 24 giờ

#### Story Display

- **Stories Bar:** Horizontal scroll ở top của Home
  - Avatar với blue ring (chưa xem)
  - Gray ring (đã xem)
  - "+" button (create story)
- **Story Viewer:** Full-screen như Instagram/Facebook
  - Progress bars cho mỗi story
  - Auto-advance sau 8 giây
  - Tap left/right để navigate
  - Swipe up/down để close
  - Pause khi tương tác

#### Story Interactions

- **Emoji reactions:** 8 emojis (❤️😂😮😢😡👍🔥🎉)
  - Click 😊 button
  - Popup picker
  - Auto-pause khi mở picker
- **Private replies:** Direct message to author
  - Click input box
  - Type message
  - Chỉ author và người reply thấy (như Facebook)
  - Auto-pause khi typing
- **View count:** Cho story owner
- **Viewers list:** Xem ai đã xem

#### Story Features

- **Video control:** Auto-play, muted, loop
- **Pause indicator:** || symbol + "Đã tạm dừng"
- **Interaction notice:** "⏸️ Story tạm dừng khi bạn tương tác"
- **Keyboard shortcuts:**
  - Space: Pause/Resume
  - Arrow keys: Navigate
  - Esc: Close viewer
- **Delete story:** Chỉ owner, với confirmation dialog

---

### 6. 👥 Friends System

#### Friend Management

- **Send friend request:** Click "Add Friend" button
- **Accept request:** From notifications or Friends page
- **Decline request:** Reject với optional message
- **Unfriend:** Remove from friends list
- **Friend count:** Display on profile

#### Friend Discovery

- **Suggestions:** Based on mutual friends
- **Search users:** By name/email
- **Browse:** All users (public directory)
- **Mutual friends:** Count and list
- **Friend status badge:**
  - ✅ Friends
  - ⏳ Request sent
  - 📩 Request received
  - ➕ Add friend

#### Friends Page

- **Tabs:**
  - All Friends (list với search)
  - Friend Requests (pending incoming)
  - Suggestions (recommended)
- **Quick actions:**
  - Message friend
  - View profile
  - Unfriend

---

### 7. 🎭 Groups (Communities)

#### Create Group

- **Basic info:** Name, Description
- **Media:** Avatar & Cover image
- **Settings:**
  - Privacy: Public/Private/Secret
  - Category (optional)
  - Tags (comma-separated)
  - Member approval required (toggle)
  - Posts enabled (toggle)

#### Group Features

- **Group posts:** Post directly to group timeline
- **Anonymous posting:** Hide your identity in posts
- **Group chat:** Real-time messaging (coming soon)
- **Member list:** View all members với roles
- **Pending requests:** Queue for approval (if enabled)

#### Member Roles & Permissions

**👑 Admin (Creator)**

- Full control của group
- Edit all settings
- Delete group
- Transfer admin role
- Promote/Demote moderators
- Remove any member
- Ban/Unban members
- Approve/Reject join requests

**🛡️ Moderator**

- Remove members (not admin)
- Ban/Unban members
- Approve/Reject join requests
- Invite friends
- Cannot edit settings
- Cannot delete group

**Member**

- Post in group (if enabled)
- Comment on posts
- Invite friends (if allowed)
- Leave group anytime

#### Group Management Page

**Thành viên Tab:**

- List tất cả members
- Badge hiển thị role: 👑 Admin, 🛡️ Moderator, Thành viên
- Admin controls:
  - **Lên Moderator:** Promote member
  - **Hạ Moderator:** Demote moderator
  - **🏆 Chuyển Admin:** Transfer ownership (with confirmation)
  - **Cấm:** Ban member với reason
  - **Remove:** Kick from group
- Banned members section (reason displayed)

**Chờ duyệt Tab:**

- Pending join requests
- User info: Avatar, Name, Email
- Actions: ✓ Chấp nhận / ✗ Từ chối

**Cài đặt Tab:**

- Edit name, description
- Change avatar & cover
- Privacy settings
- Category & tags
- Toggle member approval
- Toggle posts enabled

**Nguy hiểm Tab:** (Admin only)

- Delete group (permanent, with confirmation)

#### Group Discovery

- **Browse page:** All public groups
- **Search:** By name/category
- **Filter:** By category
- **Join:** Click to join public groups
- **Request:** Send request for private groups

---

### 8. 🔔 Notifications Real-time

#### Notification Types

- 👤 Friend request received
- ✅ Friend request accepted
- ❤️ Post reaction (like, love, wow...)
- 💬 New comment on your post
- 💬 Reply to your comment
- 📖 Story reply
- 😂 Story reaction
- 🎭 Group invitation
- 👥 Group member approved
- 🏷️ Tagged in post
- @ Mentioned in comment

#### Notification Features

- **Real-time delivery:** Socket.io push
- **Toast notifications:** Pop-up ở góc màn hình
- **Badge count:** Red bubble trên icon
- **Mark as read:** Click to mark
- **Mark all read:** One-click clear all
- **Delete:** Remove notification
- **Navigate:** Click to go to related content

#### Notification UI

- **Dropdown panel:** Click bell icon
- **Grouped by type:** Recent first
- **Avatar + message:** Clear information
- **Time ago:** Relative timestamps
- **Unread indicator:** Blue dot
- **Empty state:** Friendly message

---

### 9. 🤖 AI Chatbot (Gemini Integration)

#### Features

- **Gemini-powered:** Google's advanced AI
- **Context-aware:** Remembers conversation history
- **Multiple threads:** Switch between conversations
- **Smart responses:** Natural language understanding

#### Use Cases

- Ask questions
- Get suggestions
- Content ideas
- Writing assistance
- Code help
- General conversation

#### AI Settings

- Configure API key
- Choose model
- Privacy controls

---

### 10. 🎨 UI/UX Features

#### Theme System

- **Light mode:** Clean white design
- **Dark mode:** Eye-friendly dark theme
- **Auto-detect:** System preference
- **Toggle:** Quick switch button
- **Persistent:** Saved in localStorage

#### Responsive Design

- **Mobile:** < 768px (vertical layout)
- **Tablet:** 768px - 1024px (adaptive)
- **Desktop:** > 1024px (sidebar + main)
- **Touch-friendly:** Large tap targets
- **Gestures:** Swipe to navigate

#### Internationalization (i18n)

- **Vietnamese:** Default language
- **English:** Available
- **Date formatting:** vi locale (date-fns)
- **Time zones:** Auto-detect user timezone

#### Accessibility

- **Keyboard navigation:** Tab through elements
- **Screen reader:** ARIA labels
- **Focus indicators:** Visible outlines
- **Color contrast:** WCAG AA compliant
- **Alt text:** Images với descriptions

#### Loading States

- **Skeletons:** Placeholder UI
- **Spinners:** Loading indicators
- **Progress bars:** Upload/download
- **Lazy loading:** Images và components
- **Optimistic UI:** Instant feedback

---

### 11. 🔒 Security & Privacy

#### Authentication

- **Password hashing:** bcrypt (10 rounds)
- **JWT tokens:** Secure, signed
- **HttpOnly cookies:** XSS protection
- **Token refresh:** Auto-renew
- **Session timeout:** Configurable

#### Authorization

- **Role-based:** Admin, Moderator, Member
- **Resource ownership:** Can only edit own content
- **Permission checks:** Backend + frontend
- **Route guards:** Protected pages

#### Data Protection

- **Input sanitization:** Prevent injection
- **XSS prevention:** Escape HTML
- **CSRF protection:** Token validation
- **CORS:** Whitelist domains
- **Rate limiting:** Prevent abuse
  - Auth: 5 requests/minute
  - Messages: 30 requests/minute
  - Posts: 10 requests/minute
  - General: 100 requests/15min

#### Privacy Controls

- **Block users:** Hide from each other
- **Post visibility:** Public/Friends/Private
- **Profile privacy:** (Coming soon)
- **Data export:** (Coming soon)

#### Content Moderation

- **Bad words filter:** Auto-detect offensive content
- **Report system:** Flag inappropriate posts
- **Admin review:** Manual moderation
- **Auto-ban:** For severe violations

---

### 12. 📁 File Management

#### Supported Formats

- **Images:** JPEG, JPG, PNG, GIF
- **Videos:** MP4, AVI, MOV, WMV, FLV, MKV, WebM
- **Documents:** PDF, DOC, DOCX, TXT, ZIP
- **Audio:** MP3, WAV

#### Upload Features

- **Size limit:** 50MB per file
- **Multiple files:** Posts support 4 images
- **Auto-compression:** Images compressed client-side
- **Progress indicator:** Upload progress bar
- **Cancel upload:** Abort in-progress
- **Drag & drop:** Drag files to upload

#### Storage & Delivery

- **Local storage:** Files saved in `server/uploads/`
- **Unique names:** Timestamp-based (prevent collision)
- **MIME types:** Proper Content-Type headers
  - video/mp4, video/x-msvideo, video/x-matroska...
- **Accept-Ranges:** Video streaming support
- **Static serving:** Express.static middleware

#### Media Preview

- **Images:** Thumbnail grid, lightbox view
- **Videos:** HTML5 player với controls
- **Audio:** Audio player với waveform
- **PDFs:** In-browser viewer (coming soon)

---

## 🏗️ Technical Architecture

### Backend Structure

```
server/
├── config/
│   ├── database.js          # MongoDB connection
│   └── socket.js            # Socket.io server setup
├── controllers/             # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── messageController.js
│   ├── postController.js
│   ├── storyController.js
│   ├── groupController.js
│   ├── friendController.js
│   ├── notificationController.js
│   └── aiController.js
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Message.js
│   ├── Post.js
│   ├── Story.js
│   ├── Group.js
│   ├── FriendRequest.js
│   ├── Notification.js
│   └── Note.js
├── routes/                  # API endpoints
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── messageRoutes.js
│   ├── postRoutes.js
│   ├── storyRoutes.js
│   ├── groupRoutes.js
│   ├── friendRoutes.js
│   ├── notificationRoutes.js
│   └── aiRoutes.js
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── upload.js            # Multer configuration
│   ├── error.js             # Error handler
│   └── rateLimiter.js       # Rate limiting
├── utils/
│   ├── geminiService.js     # AI integration
│   ├── contentModeration.js # Bad words filter
│   └── jwt.js               # Token management
└── uploads/                 # File storage
```

### Frontend Structure

```
client/src/
├── components/
│   ├── chat/                # Chat UI components
│   ├── post/                # Post components
│   ├── story/               # Story components
│   │   ├── CreateStory.tsx
│   │   ├── StoryViewer.tsx
│   │   └── StoriesBar.tsx
│   ├── friends/             # Friend components
│   ├── groups/              # Group components
│   │   ├── InviteFriendsDialog.tsx
│   │   └── GroupInvitations.tsx
│   ├── notifications/       # Notification components
│   ├── settings/            # Settings components
│   └── ui/                  # Shadcn UI primitives
├── pages/
│   ├── HomePage.tsx
│   ├── HomePageNew.tsx      # Main newsfeed
│   ├── ChatPage.tsx
│   ├── ProfilePage.tsx
│   ├── GroupsPage.tsx
│   ├── GroupDetailPage.tsx
│   ├── GroupManagementPage.tsx  # Admin panel
│   ├── FriendsPage.tsx
│   └── SettingsPage.tsx
├── store/
│   └── authStore.ts         # Zustand auth state
├── contexts/
│   └── ThemeContext.tsx     # Theme provider
├── lib/
│   ├── axios.ts             # Axios instance
│   ├── socket.ts            # Socket.io client
│   └── utils.ts             # Helper functions
├── hooks/
│   └── useOnlineStatus.ts   # Custom hooks
└── layouts/
    └── MainLayout.tsx       # App shell
```

---

## 💾 Database Schemas

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  bio: String,
  location: String,
  website: String,
  friends: [ObjectId],
  friendRequests: [{
    from: ObjectId,
    to: ObjectId,
    status: 'pending' | 'accepted' | 'declined',
    createdAt: Date
  }],
  blockedUsers: [ObjectId],
  isOnline: Boolean,
  lastSeen: Date,
  settings: {
    theme: 'light' | 'dark',
    language: String,
    notifications: Boolean
  }
}
```

### Post Model

```javascript
{
  author: ObjectId,
  content: String,
  images: [String],
  video: String,
  reactions: [{
    user: ObjectId,
    type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | 'thumbsup' | 'fire' | 'party',
    createdAt: Date
  }],
  comments: [{
    user: ObjectId,
    content: String,
    replies: [{ ... }],
    createdAt: Date
  }],
  shares: Number,
  visibility: 'public' | 'friends' | 'private',
  taggedUsers: [ObjectId],
  group: ObjectId,
  isAnonymous: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Story Model

```javascript
{
  author: ObjectId,
  content: String,
  media: String (required),
  mediaType: 'image' | 'video',
  backgroundColor: String,
  viewers: [{
    user: ObjectId,
    viewedAt: Date
  }],
  reactions: [{
    user: ObjectId,
    emoji: String,
    createdAt: Date
  }],
  replies: [{
    user: ObjectId,
    message: String,
    createdAt: Date
  }],
  expiresAt: Date,  // TTL index: auto-delete after 24h
  createdAt: Date
}
```

### Group Model

```javascript
{
  name: String,
  description: String,
  avatar: String,
  coverImage: String,
  admin: ObjectId,
  moderators: [ObjectId],
  members: [ObjectId],
  pendingMembers: [{
    user: ObjectId,
    requestedAt: Date
  }],
  bannedMembers: [{
    user: ObjectId,
    bannedAt: Date,
    reason: String
  }],
  invitations: [{
    user: ObjectId,
    invitedBy: ObjectId,
    invitedAt: Date
  }],
  privacy: 'public' | 'private' | 'secret',
  category: String,
  tags: [String],
  memberApprovalRequired: Boolean,
  postsEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

```javascript
{
  sender: ObjectId,
  receiver: ObjectId,
  content: String,
  messageType: 'text' | 'image' | 'video' | 'file' | 'audio',
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  reactions: [{
    user: ObjectId,
    emoji: String,
    createdAt: Date
  }],
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌐 Socket.io Events

### Client → Server

```javascript
// Connection
'connected'

// Chat
'sendMessage' { receiverId, content, messageType, fileUrl }
'typing' { receiverId }
'stopTyping' { receiverId }
'messageRead' { messageId }

// Calls
'call-user' { userToCall, signalData, from, name }
'answer-call' { signal, to }
'end-call' { userId }

// Presence
'userOnline' { userId }
'userOffline' { userId }
```

### Server → Client

```javascript
// Chat
'receiveMessage' { message, sender }
'typing' { senderId }
'stopTyping' { senderId }
'messageStatus' { messageId, status }

// Notifications
'notification' { type, data }
'newPost' { post }
'friendRequest' { request }

// Calls
'call-incoming' { signal, from, name }
'call-accepted' { signal }
'call-ended' { userId }

// Presence
'userStatusChange' { userId, isOnline }
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Đăng ký tài khoản mới
- `POST /login` - Đăng nhập
- `POST /logout` - Đăng xuất
- `GET /me` - Lấy thông tin user hiện tại

### Users (`/api/users`)

- `GET /` - Lấy danh sách users
- `GET /:userId` - Lấy thông tin 1 user
- `PUT /profile` - Cập nhật profile
- `PUT /password` - Đổi mật khẩu
- `POST /block/:userId` - Block user
- `DELETE /unblock/:userId` - Unblock user

### Messages (`/api/messages`)

- `GET /:userId` - Lấy conversation với user
- `POST /` - Gửi tin nhắn
- `PUT /:messageId` - Cập nhật tin nhắn
- `DELETE /:messageId` - Xóa tin nhắn
- `POST /:messageId/reaction` - Thả emoji reaction

### Posts (`/api/posts`)

- `GET /` - Lấy newsfeed
- `GET /:postId` - Lấy 1 post
- `POST /` - Tạo post mới
- `PUT /:postId` - Cập nhật post
- `DELETE /:postId` - Xóa post
- `POST /:postId/reaction` - Thả reaction
- `POST /:postId/comment` - Bình luận
- `POST /:postId/share` - Chia sẻ post

### Stories (`/api/stories`)

- `GET /` - Lấy tất cả stories
- `GET /my-stories` - Lấy stories của mình
- `POST /` - Tạo story mới
- `POST /:storyId/view` - Mark story as viewed
- `POST /:storyId/reaction` - Thả emoji
- `POST /:storyId/reply` - Gửi reply
- `GET /:storyId/replies` - Lấy replies
- `DELETE /:storyId` - Xóa story

### Groups (`/api/groups`)

- `GET /` - Lấy groups của user
- `GET /discover` - Browse public groups
- `GET /:groupId` - Lấy thông tin group
- `POST /` - Tạo group mới
- `PUT /:groupId` - Cập nhật group
- `DELETE /:groupId` - Xóa group
- `POST /:groupId/join` - Join group
- `POST /:groupId/invite` - Mời friends
- `POST /:groupId/moderators/:userId` - Promote moderator
- `DELETE /:groupId/moderators/:userId` - Demote moderator
- `POST /:groupId/transfer-admin/:userId` - Chuyển admin
- `POST /:groupId/ban/:userId` - Ban member
- `DELETE /:groupId/ban/:userId` - Unban member
- `POST /:groupId/approve/:userId` - Duyệt join request
- `DELETE /:groupId/approve/:userId` - Từ chối request
- `DELETE /:groupId/members/:userId` - Remove member
- `DELETE /:groupId/leave` - Rời group

### Friends (`/api/friends`)

- `GET /` - Lấy danh sách friends
- `GET /requests` - Lấy friend requests
- `GET /suggestions` - Lấy friend suggestions
- `POST /request/:userId` - Gửi friend request
- `PUT /accept/:requestId` - Chấp nhận request
- `DELETE /decline/:requestId` - Từ chối request
- `DELETE /:friendId` - Unfriend

### Notifications (`/api/notifications`)

- `GET /` - Lấy tất cả notifications
- `PUT /:notificationId/read` - Mark as read
- `PUT /read-all` - Mark all as read
- `DELETE /:notificationId` - Xóa notification

### AI (`/api/ai`)

- `POST /chat` - Chat với Gemini AI

---

## ⚙️ Configuration

### Environment Variables

#### Server (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/social-network

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Client
CLIENT_URL=http://localhost:5173

# AI
GEMINI_API_KEY=your-gemini-api-key
```

#### Client (`.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### File Upload Configuration

**Location:** `server/middleware/upload.js`

```javascript
// File size limit
limits: {
  fileSize: 50 * 1024 * 1024, // 50MB
}

// Allowed file types
const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|mp4|avi|mov|wmv|flv|mkv|webm|mp3|wav/;
```

### Rate Limiting

**Location:** `server/middleware/rateLimiter.js`

```javascript
// Auth endpoints: 5 requests/minute
authLimiter: windowMs: 60000, max: 5

// Message endpoints: 30 requests/minute
messageLimiter: windowMs: 60000, max: 30

// Post endpoints: 10 requests/minute
postLimiter: windowMs: 60000, max: 10

// General API: 100 requests/15 minutes
generalLimiter: windowMs: 900000, max: 100
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js:** 18.x hoặc mới hơn
- **MongoDB:** 6.x (local hoặc Atlas)
- **npm:** hoặc yarn

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd TestAI
```

### Step 2: Install Dependencies

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd client
npm install
```

### Step 3: Configure Environment

Tạo file `.env` trong `server/` và `client/` theo template ở trên.

### Step 4: Start MongoDB

**Local MongoDB:**

```bash
mongod --dbpath /path/to/data
```

**MongoDB Atlas:**

- Tạo cluster trên MongoDB Atlas
- Copy connection string vào `MONGODB_URI`

### Step 5: Run Application

**Backend (Terminal 1):**

```bash
cd server
npm run dev
```

**Frontend (Terminal 2):**

```bash
cd client
npm run dev
```

### Step 6: Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Socket.io:** ws://localhost:5000

---

## 📊 Performance Optimizations

### Frontend

- **Code splitting:** React.lazy() cho routes
- **Lazy loading:** Images với loading="lazy"
- **Memoization:** React.memo, useMemo, useCallback
- **Virtualization:** Window virtual lists (coming soon)
- **Debouncing:** Search inputs (300ms)
- **Throttling:** Scroll events (100ms)
- **Image compression:** Client-side với browser-image-compression
- **Cache:** LocalStorage cho theme, auth tokens

### Backend

- **Database indexing:**
  - User: email (unique), friends
  - Post: author, createdAt, group
  - Story: author + expiresAt, TTL index
  - Message: sender + receiver
  - Group: admin, members
- **Query optimization:**
  - Projection (select fields)
  - Population (join documents)
  - Lean queries (plain objects)
- **Pagination:** Limit + skip
- **Rate limiting:** Express-rate-limit
- **Caching:** (Coming soon)

### Network

- **Compression:** gzip responses
- **CDN:** (Coming soon)
- **WebP images:** (Coming soon)
- **HTTP/2:** (Coming soon)

---

## 🐛 Troubleshooting

### Video không phát

**Nguyên nhân:** MIME type không đúng  
**Giải pháp:**

1. Restart server sau khi cập nhật MIME types
2. Kiểm tra `server.js` có serve static files với headers đúng
3. Browser cache - clear cache hoặc hard refresh (Ctrl+Shift+R)

### Stories không tự xóa sau 24h

**Nguyên nhân:** MongoDB TTL index chưa active  
**Giải pháp:**

1. MongoDB phải running
2. Kiểm tra index: `db.stories.getIndexes()`
3. TTL chạy mỗi 60 giây, có độ trễ

### Socket.io không connect

**Nguyên nhân:** CORS hoặc URL sai  
**Giải pháp:**

1. Kiểm tra `CLIENT_URL` trong server `.env`
2. Xem CORS config trong `server.js`
3. Browser console có lỗi gì
4. Firewall block port 5000?

### File upload fail

**Nguyên nhân:** File quá lớn hoặc type không hỗ trợ  
**Giải pháp:**

1. Kiểm tra file size < 50MB
2. File type trong whitelist (`upload.js`)
3. Thư mục `uploads/` phải tồn tại và có quyền write
4. Multer error trong console

### Group management lỗi "Cannot read charAt"

**Nguyên nhân:** Member data chưa populate  
**Giải pháp:**

1. Backend `getGroup` API phải populate:
   - `pendingMembers.user`
   - `moderators`
   - `bannedMembers.user`
2. Frontend có optional chaining: `member.name?.charAt(0)`

---

## 🎯 Roadmap & Future Features

### Phase 1: Core Improvements

- [ ] Message editing
- [ ] Message search
- [ ] Voice messages (WebRTC recording)
- [ ] Story mentions (@username)
- [ ] Story music/stickers

### Phase 2: Social Features

- [ ] Polls & Surveys
- [ ] Events & Calendar
- [ ] Marketplace
- [ ] Pages (Business profiles)
- [ ] Verified badges

### Phase 3: Advanced Features

- [ ] Live streaming
- [ ] Screen sharing in calls
- [ ] Group video calls (max 4 people)
- [ ] Stories highlights (save favorite stories)
- [ ] Post scheduling

### Phase 4: Platform

- [ ] Progressive Web App (PWA)
- [ ] Push notifications (Web Push API)
- [ ] Mobile apps (React Native)
- [ ] Desktop app (Electron)
- [ ] Browser extension

### Phase 5: Enterprise

- [ ] End-to-end encryption
- [ ] Data export/backup
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Moderation tools

---

## 📜 License

MIT License - Sử dụng tự do cho học tập và thương mại.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Made with ❤️ using modern web technologies**
