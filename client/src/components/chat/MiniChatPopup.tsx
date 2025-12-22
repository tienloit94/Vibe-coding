import { useState, useEffect, useRef } from 'react';
import { X, Minimize2, Maximize2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { getAssetUrl } from '@/lib/config';
import { vi, enUS, ja } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Message } from '@/types';

interface MiniChatPopupProps {
  userId: string;
  onClose: () => void;
}

export default function MiniChatPopup({ userId, onClose }: MiniChatPopupProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const { users, messages, fetchMessages, sendMessage, fetchUsers } = useChatStore();
  const { user } = useAuthStore();
  const { i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatUser = users.find((u) => u._id === userId);
  const userMessages = messages[userId] || [];
  
  console.log('🎯 MiniChatPopup State:', {
    userId,
    hasMessagesForUser: !!messages[userId],
    messageCount: userMessages.length,
    allMessageKeys: Object.keys(messages),
  });

  // Fetch users if not loaded
  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, [users.length, fetchUsers]);

  // Fetch messages when userId changes
  useEffect(() => {
    if (userId && !isMinimized) {
      console.log('🔵 MiniChatPopup: Fetching messages for userId:', userId);
      fetchMessages(userId);
    }
  }, [userId, isMinimized, fetchMessages]);

  useEffect(() => {
    console.log('💬 MiniChatPopup: Messages updated:', userMessages.length, 'messages');
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [userMessages, isMinimized]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return;

    await sendMessage(userId, newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getLocale = () => {
    switch (i18n.language) {
      case 'vi':
        return vi;
      case 'ja':
        return ja;
      default:
        return enUS;
    }
  };

  // If chatUser not found yet, show loading or create temporary user object
  const displayUser = chatUser || {
    _id: userId,
    name: 'Loading...',
    email: '',
    avatar: '',
    isOnline: false,
  };

  return (
    <div 
      className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
      style={{ height: isMinimized ? 'auto' : '480px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={getAssetUrl(displayUser.avatar)} 
              alt={displayUser.name} 
            />
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              {displayUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-white">{displayUser.name}</p>
            <p className="text-xs text-blue-100">
              {displayUser.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            <div className="space-y-3">
              {userMessages.map((message: Message) => {
                const isOwn = message.sender._id === user?._id;
                const senderInfo = isOwn ? user : chatUser;
                
                return (
                  <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                      <Avatar className="h-7 w-7 mr-2 mt-1">
                        <AvatarImage 
                          src={getAssetUrl(senderInfo?.avatar)} 
                          alt={senderInfo?.name} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                          {senderInfo?.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%]`}>
                      {message.messageType === 'text' && (
                        <div
                          className={`rounded-2xl px-3 py-2 ${
                            isOwn
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                      )}
                      {message.messageType === 'image' && (
                        <img
                          src={getAssetUrl(message.fileUrl)}
                          alt="Sent image"
                          className="max-w-full rounded-lg"
                        />
                      )}
                      {message.messageType === 'file' && (
                        <div
                          className={`rounded-2xl px-3 py-2 ${
                            isOwn
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <a
                            href={getAssetUrl(message.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                          >
                            📎 {message.fileName}
                          </a>
                        </div>
                      )}
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {format(new Date(message.createdAt), 'HH:mm', { locale: getLocale() })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Aa"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-full"
              />
              <Button 
                size="icon" 
                className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                onClick={handleSend}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
