import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useGroupStore } from '@/store/groupStore';
import { useBlockStore } from '@/store/blockStore';
import socketService from '@/lib/socket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Paperclip, Download, Phone, Video, X, Ban, CheckCircle, Smile, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from './EmojiPicker';
import VideoCall from './VideoCall';
import GroupChatArea from '@/components/groups/GroupChatArea';
import UserProfileModal from './UserProfileModal';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function ChatArea() {
  const selectedGroup = useGroupStore((state) => state.selectedGroup);
  
  // If group is selected, show group chat
  if (selectedGroup) {
    return <GroupChatArea />;
  }
  const [messageInput, setMessageInput] = useState('');
  const [isTypingState, setIsTypingState] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ from: string; callerName: string; signal: any } | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((state) => state.user);
  const { selectedUser, messages, sendMessage, isTyping, typingUser, hasMoreMessages, loadingMessages, loadMoreMessages, addReaction } = useChatStore();
  const { blockUser, unblockUser, isBlocked, fetchBlockedUsers } = useBlockStore();

  // Get messages for selected user
  const userMessages = selectedUser ? messages[selectedUser._id] || [] : [];

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      await blockUser(selectedUser._id);
      toast.success(`Đã chặn ${selectedUser.name}`);
    } catch (error: any) {
      toast.error(error.message || 'Không thể chặn người dùng');
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedUser) return;
    try {
      await unblockUser(selectedUser._id);
      toast.success(`Đã bỏ chặn ${selectedUser.name}`);
    } catch (error) {
      toast.error('Không thể bỏ chặn người dùng');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      toast.error('Không thể thêm reaction');
    }
  };

  const userIsBlocked = selectedUser ? isBlocked(selectedUser._id) : false;

  // Listen for incoming calls
  useEffect(() => {
    socketService.on('call-made', (data: { from: string; callerName: string; signal: any }) => {
      console.log('📞 Incoming call from:', data.callerName);
      setIncomingCall({ from: data.from, callerName: data.callerName, signal: data.signal });
    });

    socketService.on('call-ended', () => {
      console.log('📵 Call ended');
      setShowVideoCall(false);
      setIncomingCall(null);
    });

    return () => {
      socketService.off('call-made');
      socketService.off('call-ended');
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle infinite scroll for loading more messages
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || !selectedUser || !hasMoreMessages || loadingMessages) return;

    // Check if scrolled to top (within 100px)
    if (container.scrollTop < 100) {
      const previousScrollHeight = container.scrollHeight;
      loadMoreMessages(selectedUser._id).then(() => {
        // Maintain scroll position after loading old messages
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - previousScrollHeight;
          }
        });
      });
    }
  };

  const handleTyping = () => {
    if (!isTypingState && selectedUser) {
      setIsTypingState(true);
      socketService.emit('typing', selectedUser._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingState(false);
      if (selectedUser) {
        socketService.emit('stop-typing', selectedUser._id);
      }
    }, 3000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if ((!messageInput.trim() && !selectedFile) || !selectedUser) return;
    
    // Check if user is blocked
    if (userIsBlocked) {
      toast.error('Không thể gửi tin nhắn. Người dùng đã bị chặn.');
      return;
    }

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTypingState(false);
    socketService.emit('stop-typing', selectedUser._id);

    try {
      await sendMessage(selectedUser._id, messageInput.trim(), selectedFile || undefined);
      setMessageInput('');
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi tin nhắn');
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        // Check original file size
        const originalSize = file.size / 1024 / 1024; // MB
        
        if (originalSize > 10) {
          toast.error('File size must be less than 10MB');
          return;
        }

        // Compress image if larger than 1MB
        if (originalSize > 1) {
          toast.info('Compressing image...');
          
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: file.type,
          };

          try {
            const compressedFile = await imageCompression(file, options);
            const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(0);
            
            toast.success(`Image compressed by ${compressionRatio}%`);
            setSelectedFile(compressedFile);
          } catch (error) {
            console.error('Compression error:', error);
            toast.error('Failed to compress image, using original');
            setSelectedFile(file);
          }
        } else {
          setSelectedFile(file);
        }
      } else {
        // Non-image files
        if (file.size > 10 * 1024 * 1024) {
          toast.error('File size must be less than 10MB');
          return;
        }
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('File select error:', error);
      toast.error('Failed to process file');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const renderMessageContent = (message: any) => {
    const baseUrl = 'http://localhost:5000';
    
    if (message.messageType === 'image') {
      return (
        <div>
          <img 
            src={baseUrl + message.fileUrl} 
            alt={message.fileName}
            className="max-w-xs rounded cursor-pointer"
            onClick={() => window.open(baseUrl + message.fileUrl, '_blank')}
          />
          {message.content && <p className="mt-2 text-sm">{message.content}</p>}
        </div>
      );
    }
    
    if (message.messageType === 'video') {
      return (
        <div>
          <video 
            src={baseUrl + message.fileUrl} 
            controls 
            className="max-w-xs rounded"
          />
          {message.content && <p className="mt-2 text-sm">{message.content}</p>}
        </div>
      );
    }
    
    if (message.messageType === 'audio') {
      return (
        <div>
          <audio src={baseUrl + message.fileUrl} controls className="max-w-xs" />
          {message.content && <p className="mt-2 text-sm">{message.content}</p>}
        </div>
      );
    }
    
    if (message.messageType === 'file') {
      return (
        <div className="flex items-center space-x-2">
          <Paperclip className="h-4 w-4" />
          <div className="flex-1">
            <a 
              href={baseUrl + message.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium underline"
            >
              {message.fileName}
            </a>
            <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(baseUrl + message.fileUrl, '_blank')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    return <p className="break-words text-sm">{message.content}</p>;
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <MessageSquare className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Select a conversation
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Choose a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between space-x-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2 -ml-2" onClick={() => setShowUserProfile(true)}>
          <Avatar>
            <AvatarImage src={selectedUser.avatar ? `http://localhost:5000${selectedUser.avatar}` : undefined} alt={selectedUser.name} />
            <AvatarFallback>
              {selectedUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold dark:text-white">{selectedUser.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedUser.isOnline ? (
                <span className="text-green-600 dark:text-green-400">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            title="Voice Call"
            onClick={() => setShowVideoCall(true)}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Video Call"
            onClick={() => setShowVideoCall(true)}
          >
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowUserProfile(true)}>
                <UserIcon className="mr-2 h-4 w-4" />
                Xem trang cá nhân
              </DropdownMenuItem>
              {userIsBlocked ? (
                <DropdownMenuItem onClick={handleUnblockUser} className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Bỏ chặn người dùng
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleBlockUser} className="text-red-600">
                  <Ban className="mr-2 h-4 w-4" />
                  Chặn người dùng
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="space-y-4 overflow-y-auto h-full"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {/* Loading indicator for infinite scroll */}
          {loadingMessages && hasMoreMessages && (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
          {userMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            userMessages.map((message) => {
              const isOwnMessage = message.sender._id === user?._id;
              const reactions = message.reactions || [];
              const reactionCounts = reactions.reduce((acc: any, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {});

              return (
                <div
                  key={message._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[70%] items-end space-x-2 ${
                      isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={message.sender.avatar ? `http://localhost:5000${message.sender.avatar}` : undefined}
                        alt={message.sender.name}
                      />
                      <AvatarFallback>
                        {message.sender.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="relative group">
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        {renderMessageContent(message)}
                      </div>
                      
                      {/* Reaction Button */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`absolute ${isOwnMessage ? '-left-8' : '-right-8'} top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0`}
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <div className="flex gap-1">
                            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message._id, emoji)}
                                className="text-2xl hover:scale-125 transition-transform p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Display Reactions */}
                      {reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          {Object.entries(reactionCounts).map(([emoji, count]: [string, any]) => (
                            <span 
                              key={emoji}
                              className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                              onClick={() => handleReaction(message._id, emoji)}
                            >
                              <span className="mr-1">{emoji}</span>
                              <span className="text-gray-700 dark:text-gray-300">{count}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <p className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${isOwnMessage ? 'text-right' : ''}`}>
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {isTyping && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedUser.avatar ? `http://localhost:5000${selectedUser.avatar}` : undefined} alt={selectedUser.name} />
                <AvatarFallback>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{typingUser || selectedUser.name} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        {userIsBlocked && (
          <div className="mb-3 rounded bg-red-50 dark:bg-red-900/20 p-3 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              Bạn đã chặn người dùng này. Bỏ chặn để có thể nhắn tin.
            </p>
          </div>
        )}
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between rounded bg-gray-100 dark:bg-gray-700 p-2">
            <div className="flex items-center space-x-2">
              <Paperclip className="h-4 w-4 dark:text-gray-300" />
              <span className="text-sm dark:text-white">{selectedFile.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({formatFileSize(selectedFile.size)})
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            className="flex-1"
          />
          <EmojiPicker
            onEmojiSelect={(emoji) => {
              setMessageInput((prev) => prev + emoji);
            }}
          />
          <Button type="submit" disabled={!messageInput.trim() && !selectedFile}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Video Call Component */}
      {showVideoCall && selectedUser && user && (
        <VideoCall
          recipientId={selectedUser._id}
          recipientName={selectedUser.name}
          onClose={() => setShowVideoCall(false)}
          isIncoming={false}
          callerId={user._id}
        />
      )}

      {/* Incoming Call Dialog */}
      {incomingCall && (
        <VideoCall
          recipientId={incomingCall.from}
          recipientName={incomingCall.callerName}
          onClose={() => setIncomingCall(null)}
          isIncoming={true}
          callerId={incomingCall.from}
          signal={incomingCall.signal}
        />
      )}

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <UserProfileModal
          userId={selectedUser._id}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </div>
  );
}
