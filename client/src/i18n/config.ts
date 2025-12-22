import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      // Navigation
      home: 'Trang chủ',
      messages: 'Tin nhắn',
      friends: 'Bạn bè',
      notifications: 'Thông báo',
      profile: 'Trang cá nhân',
      
      // Actions
      search: 'Tìm kiếm...',
      post: 'Đăng',
      photo: 'Ảnh',
      video: 'Video',
      editProfile: 'Chỉnh sửa',
      logout: 'Đăng xuất',
      save: 'Lưu',
      cancel: 'Hủy',
      send: 'Gửi',
      viewAll: 'Xem tất cả',
      
      // Messages
      noMessages: 'Chưa có tin nhắn nào',
      goToMessages: 'Đi đến trang tin nhắn',
      
      // Post
      whatsOnYourMind: 'Bạn đang nghĩ gì?',
      postCreated: 'Đã đăng bài!',
      postFailed: 'Đăng bài thất bại',
      likes: 'thích',
      comments: 'bình luận',
      share: 'Chia sẻ',
      writeComment: 'Viết bình luận...',
      
      // Profile
      posts: 'bài viết',
      noPosts: 'Chưa có bài viết nào',
      name: 'Tên',
      bio: 'Giới thiệu',
      
      // Friends
      noFriends: 'Chưa có bạn bè. Hãy tìm kiếm để kết bạn!',
      message: 'Nhắn tin',
      removeFriend: 'Hủy kết bạn',
      
      // Notifications
      friendRequests: 'Lời mời kết bạn',
      accept: 'Chấp nhận',
      reject: 'Từ chối',
      noNotifications: 'Không có thông báo nào',
      
      // Settings
      language: 'Ngôn ngữ',
      theme: 'Giao diện',
      lightMode: 'Sáng',
      darkMode: 'Tối',
    }
  },
  en: {
    translation: {
      // Navigation
      home: 'Home',
      messages: 'Messages',
      friends: 'Friends',
      notifications: 'Notifications',
      profile: 'Profile',
      
      // Actions
      search: 'Search...',
      post: 'Post',
      photo: 'Photo',
      video: 'Video',
      editProfile: 'Edit Profile',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      send: 'Send',
      viewAll: 'View all',
      
      // Messages
      noMessages: 'No messages yet',
      goToMessages: 'Go to Messages',
      
      // Post
      whatsOnYourMind: "What's on your mind?",
      postCreated: 'Post created!',
      postFailed: 'Failed to create post',
      likes: 'likes',
      comments: 'comments',
      share: 'Share',
      writeComment: 'Write a comment...',
      
      // Profile
      posts: 'posts',
      noPosts: 'No posts yet',
      name: 'Name',
      bio: 'Bio',
      
      // Friends
      noFriends: 'No friends yet. Search for people to add!',
      message: 'Message',
      removeFriend: 'Remove Friend',
      
      // Notifications
      friendRequests: 'Friend Requests',
      accept: 'Accept',
      reject: 'Reject',
      noNotifications: 'No notifications',
      
      // Settings
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light',
      darkMode: 'Dark',
    }
  },
  ja: {
    translation: {
      // Navigation
      home: 'ホーム',
      messages: 'メッセージ',
      friends: '友達',
      notifications: '通知',
      profile: 'プロフィール',
      
      // Actions
      search: '検索...',
      post: '投稿',
      photo: '写真',
      video: '動画',
      editProfile: 'プロフィール編集',
      logout: 'ログアウト',
      save: '保存',
      cancel: 'キャンセル',
      send: '送信',
      viewAll: 'すべて表示',
      
      // Messages
      noMessages: 'メッセージがありません',
      goToMessages: 'メッセージページへ',
      
      // Post
      whatsOnYourMind: '今何してる？',
      postCreated: '投稿しました！',
      postFailed: '投稿に失敗しました',
      likes: 'いいね',
      comments: 'コメント',
      share: 'シェア',
      writeComment: 'コメントを書く...',
      
      // Profile
      posts: '投稿',
      noPosts: '投稿はまだありません',
      name: '名前',
      bio: '自己紹介',
      
      // Friends
      noFriends: '友達がいません。検索して追加しましょう！',
      message: 'メッセージ',
      removeFriend: '友達解除',
      
      // Notifications
      friendRequests: '友達リクエスト',
      accept: '承認',
      reject: '拒否',
      noNotifications: '通知はありません',
      
      // Settings
      language: '言語',
      theme: 'テーマ',
      lightMode: 'ライト',
      darkMode: 'ダーク',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
