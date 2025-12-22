import { useState, useEffect, useRef, FormEvent } from 'react';
import { useGroupStore } from '@/store/groupStore';
import { useAuthStore } from '@/store/authStore';
import socketService from '@/lib/socket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreVertical, Send, Paperclip, Users, LogOut, UserPlus, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from '@/components/chat/EmojiPicker';
import { toast } from 'sonner';

export default function GroupChatArea() {
  const { selectedGroup, groupMessages, sendGroupMessage, addGroupMessage, leaveGroup } = useGroupStore();
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = selectedGroup?.admin._id === user?._id;

  // Listen for group messages
  useEffect(() => {
    if (!selectedGroup) return;

    socketService.on('group-message-received', (data: { groupId: string; message: any }) => {
      if (data.groupId === selectedGroup._id) {
        addGroupMessage(data.message);
      }
    });

    return () => {
      socketService.off('group-message-received');
    };
  }, [selectedGroup, addGroupMessage]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedGroup) return;
    
    try {
      await sendGroupMessage(selectedGroup._id, message);
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    
    if (confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(selectedGroup._id);
      } catch (error) {
        console.error('Failed to leave group:', error);
      }
    }
  };

  if (!selectedGroup) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-50">
        <Users className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">Select a group to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {selectedGroup.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{selectedGroup.name}</h2>
            <p className="text-xs text-gray-500">
              {selectedGroup.members.length + 1} members
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Members List */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Group Members</SheetTitle>
                <SheetDescription>
                  {selectedGroup.members.length + 1} members in this group
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                <div className="space-y-3">
                  {/* Admin */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedGroup.admin.avatar} alt={selectedGroup.admin.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {selectedGroup.admin.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedGroup.admin.name}</p>
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{selectedGroup.admin.email}</p>
                    </div>
                    {selectedGroup.admin.isOnline && (
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                    )}
                  </div>

                  {/* Members */}
                  {selectedGroup.members.map((member) => (
                    <div key={member._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                      {member.isOnline && (
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin && (
                <>
                  <DropdownMenuItem>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Members
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={handleLeaveGroup}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {groupMessages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Welcome to {selectedGroup.name}!</p>
              <p className="text-sm text-gray-400 mt-1">
                Start chatting with your group members
              </p>
              {selectedGroup.description && (
                <p className="text-sm text-gray-500 mt-3 max-w-md">
                  {selectedGroup.description}
                </p>
              )}
            </div>
          ) : (
            /* Display Messages */
            groupMessages.map((msg) => {
              const isSender = msg.sender._id === user?._id;
              
              return (
                <div
                  key={msg._id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[70%] ${isSender ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                        {msg.sender.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          {isSender ? 'You' : msg.sender.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {msg.messageType === 'file' ? (
                        <div className={`rounded-lg p-3 ${isSender ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4" />
                            <a
                              href={`http://localhost:5000${msg.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {msg.fileName}
                            </a>
                            <a
                              href={`http://localhost:5000${msg.fileUrl}`}
                              download={msg.fileName}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className={`rounded-lg p-3 ${isSender ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <EmojiPicker onEmojiSelect={(emoji) => setMessage(prev => prev + emoji)} />
            </div>
          </div>

          <Button 
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
