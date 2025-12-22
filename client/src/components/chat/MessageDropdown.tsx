import { useState, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS, ja } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getAssetUrl } from '@/lib/config';

interface MessageDropdownProps {
  onOpenChat: (userId: string) => void;
}

export default function MessageDropdown({ onOpenChat }: MessageDropdownProps) {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { conversations, fetchConversations } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total unread
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  useEffect(() => {
    const interval = setInterval(fetchConversations, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchConversations();
    }
  };

  const handleConversationClick = (userId: string) => {
    onOpenChat(userId);
    setIsOpen(false);
  };

  const handleGoToMessages = () => {
    navigate('/messages');
    setIsOpen(false);
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

  const truncateMessage = (text: string, maxLength: number = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <MessageCircle className="h-5 w-5" />
          {totalUnread > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
          <h3 className="font-semibold dark:text-white">{t('messages')}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoToMessages}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {t('viewAll')}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        <ScrollArea className="h-96">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{t('noMessages')}</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {conversations.map((conversation) => (
                <div
                  key={conversation.user._id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    (conversation.unreadCount || 0) > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleConversationClick(conversation.user._id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={getAssetUrl(conversation.user.avatar)} 
                          alt={conversation.user.name} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {conversation.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.user.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <p className={`text-sm font-medium truncate dark:text-white ${
                          (conversation.unreadCount || 0) > 0 ? 'font-bold' : ''
                        }`}>
                          {conversation.user.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                            addSuffix: true,
                            locale: getLocale(),
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${
                          (conversation.unreadCount || 0) > 0 
                            ? 'font-semibold text-gray-900 dark:text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {conversation.lastMessage.messageType === 'text' 
                            ? truncateMessage(conversation.lastMessage.content)
                            : conversation.lastMessage.messageType === 'image'
                            ? '📷 Hình ảnh'
                            : '📎 Tệp đính kèm'
                          }
                        </p>
                        
                        {(conversation.unreadCount || 0) > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white ml-2">
                            {(conversation.unreadCount || 0) > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={handleGoToMessages}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('goToMessages')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
