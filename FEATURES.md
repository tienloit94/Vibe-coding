# Real-time Chat Application - Features Documentation

## 🎯 Core Features

### 1. **User Authentication**
- Register new accounts with email and password
- Login with JWT token-based authentication
- Automatic session management with HttpOnly cookies
- Logout functionality

### 2. **Real-time Messaging**
- Send and receive text messages instantly
- Online/Offline status indicators
- Typing indicators
- Message timestamps with "time ago" format
- Message read receipts

### 3. **File Sharing** 📎
- **Supported File Types:**
  - Images: JPEG, JPG, PNG, GIF
  - Videos: MP4
  - Audio: MP3, WAV
  - Documents: PDF, DOC, DOCX, TXT, ZIP
- **Features:**
  - 10MB file size limit
  - Inline image preview
  - Video/audio playback
  - File download capability
  - File size display
  - File name preservation

### 4. **Emoji Support** 😊
- 160+ emojis available
- Quick emoji picker popup
- Click to insert emojis in messages

### 5. **Voice & Video Calls** 📞
- **WebRTC-based peer-to-peer calling**
- Voice-only calls
- Video calls with camera
- **Call Controls:**
  - Mute/Unmute microphone
  - Enable/Disable video
  - End call
  - Accept/Reject incoming calls
- Picture-in-picture local video
- Full-screen remote video
- Real-time signaling through Socket.io

## 🛠️ Technical Implementation

### Backend (Server)
- **File Upload:**
  - Multer middleware for multipart/form-data
  - Files stored in `server/uploads/` directory
  - Unique filenames with timestamps
  - Static file serving at `/uploads` endpoint
  
- **Message Types:**
  - `text` - Plain text messages
  - `image` - Image files with preview
  - `video` - Video files with player
  - `audio` - Audio files with player
  - `file` - Other documents

- **WebRTC Signaling:**
  - Socket events: `call-user`, `answer-call`, `call-accepted`, `end-call`
  - Peer-to-peer connection setup
  - Signal data exchange

### Frontend (Client)
- **File Upload UI:**
  - File selection button (Paperclip icon)
  - File preview before sending
  - File type detection
  - Size validation
  
- **Message Rendering:**
  - Dynamic content based on message type
  - Image thumbnails with click-to-expand
  - Embedded video/audio players
  - File download buttons
  
- **Video Call Component:**
  - Simple-peer library for WebRTC
  - MediaStream API for camera/microphone access
  - Incoming call notifications
  - Call state management

## 📱 User Guide

### Sending Messages
1. Type your message in the input field
2. Press Enter or click Send button
3. Message appears instantly for both users

### Sending Files
1. Click the Paperclip 📎 icon
2. Select a file (images, videos, documents)
3. Preview appears above input
4. Add optional text message
5. Click Send

### Adding Emojis
1. Click the Smile 😊 icon
2. Select emoji from popup
3. Emoji inserts at cursor position

### Making Calls
1. Click Phone ☎️ icon for voice call
2. Click Video 📹 icon for video call
3. Wait for recipient to accept
4. Use controls to mute/unmute or end call

### Receiving Calls
1. Call notification appears
2. Click green Phone icon to accept
3. Click red Phone icon to reject

## 🔧 Configuration

### Server Environment Variables
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

### File Upload Limits
- Default: 10MB per file
- Configurable in `server/middleware/upload.js`:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024, // Change this value
}
```

### Allowed File Types
Edit in `server/middleware/upload.js`:
```javascript
const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|mp4|mp3|wav/;
```

## 🎨 UI Components

### Chat Header
- User avatar and name
- Online/Offline status
- Phone and Video call buttons

### Message Bubble
- Different colors for sent/received
- Avatar with each message
- Timestamp below message
- Dynamic content rendering

### Input Area
- File attachment button
- Text input field
- Emoji picker button
- Send button

## 🚀 Performance

- **File Upload:** Optimized with streaming
- **Video Calls:** Peer-to-peer (no server relay)
- **Messages:** Real-time via WebSocket
- **Images:** Lazy loading and caching

## 🔒 Security

- JWT token authentication
- HttpOnly cookies prevent XSS
- File type validation
- File size limits
- CORS configuration
- Input sanitization

## 📊 Database Schema

### Message Model
```javascript
{
  sender: ObjectId,
  receiver: ObjectId,
  content: String,
  messageType: 'text' | 'file' | 'image' | 'video' | 'audio',
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  isRead: Boolean,
  timestamps: true
}
```

## 🐛 Troubleshooting

### File Upload Not Working
- Check `uploads/` directory exists
- Verify file size under 10MB
- Check file type is allowed

### Video Call Issues
- Grant camera/microphone permissions
- Check both users are online
- Verify WebRTC support in browser

### Messages Not Sending
- Check Socket.io connection
- Verify both users authenticated
- Check browser console for errors

## 📝 Future Enhancements
- Group chats
- Voice messages
- Screen sharing
- Message editing/deletion
- Search functionality
- Message reactions
- Push notifications
