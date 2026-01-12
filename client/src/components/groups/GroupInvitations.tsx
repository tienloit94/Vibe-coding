import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface GroupInvitation {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage?: string;
  privacy: "public" | "private" | "secret";
  category?: string;
  admin: {
    _id: string;
    name: string;
    avatar?: string;
  };
  invitedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  invitedAt: string;
}

export default function GroupInvitations() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/groups/invitations");
      setInvitations(data.invitations || []);
    } catch (error: any) {
      console.error("Failed to fetch invitations:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải lời mời nhóm"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (groupId: string) => {
    setProcessingIds(new Set([...processingIds, groupId]));
    try {
      await axios.post(`/groups/${groupId}/accept-invitation`);
      toast.success("Đã tham gia nhóm");
      setInvitations(invitations.filter((inv) => inv._id !== groupId));
      // Optionally navigate to the group
      // navigate(`/groups/${groupId}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể chấp nhận lời mời"
      );
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleDecline = async (groupId: string) => {
    setProcessingIds(new Set([...processingIds, groupId]));
    try {
      await axios.post(`/groups/${groupId}/decline-invitation`);
      toast.success("Đã từ chối lời mời");
      setInvitations(invitations.filter((inv) => inv._id !== groupId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể từ chối lời mời");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Không có lời mời nhóm</h3>
        <p className="text-muted-foreground">
          Bạn sẽ thấy lời mời tham gia nhóm ở đây
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Lời mời nhóm</h2>
        <Badge variant="secondary">{invitations.length}</Badge>
      </div>

      {invitations.map((invitation) => (
        <Card key={invitation._id} className="p-4">
          <div className="flex items-start space-x-4">
            {/* Group Avatar */}
            <Avatar
              className="h-16 w-16 cursor-pointer"
              onClick={() => navigate(`/groups/${invitation._id}`)}
            >
              <AvatarImage
                src={
                  invitation.avatar.startsWith("http")
                    ? invitation.avatar
                    : `http://localhost:5000${invitation.avatar}`
                }
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                {invitation.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3
                    className="font-semibold text-lg cursor-pointer hover:underline"
                    onClick={() => navigate(`/groups/${invitation._id}`)}
                  >
                    {invitation.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {invitation.description}
                  </p>

                  {/* Invitation Info */}
                  <div className="flex items-center space-x-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={
                          invitation.invitedBy.avatar?.startsWith("http")
                            ? invitation.invitedBy.avatar
                            : invitation.invitedBy.avatar
                            ? `http://localhost:5000${invitation.invitedBy.avatar}`
                            : undefined
                        }
                      />
                      <AvatarFallback className="text-xs bg-gray-300">
                        {invitation.invitedBy.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {invitation.invitedBy.name}
                      </span>{" "}
                      mời bạn tham gia •{" "}
                      {formatDistanceToNow(new Date(invitation.invitedAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>

                  {invitation.category && (
                    <Badge variant="secondary" className="mt-2">
                      {invitation.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation._id)}
                  disabled={processingIds.has(invitation._id)}
                >
                  {processingIds.has(invitation._id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Chấp nhận
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(invitation._id)}
                  disabled={processingIds.has(invitation._id)}
                >
                  {processingIds.has(invitation._id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Từ chối
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/groups/${invitation._id}`)}
                >
                  Xem nhóm
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
