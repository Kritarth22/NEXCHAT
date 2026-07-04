"use client";

import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, Flag, Loader2, ArrowRight, MessageSquareOff } from "lucide-react";
import { cn } from "@/lib/utils";

function formatRelativeTime(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "";
  }
}

type FlaggedMessagesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: StreamChat;
  onSelectChannel?: (channelId: string) => void;
};

export default function FlaggedMessagesModal({
  isOpen,
  onClose,
  client,
  onSelectChannel,
}: FlaggedMessagesModalProps) {
  const [flagged, setFlagged] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadFlaggedMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let fetchedMessages: any[] = [];
        try {
          const searchResponse = await client.search(
            { members: { $in: [client.userID!] } },
            { pinned: true },
            { limit: 50 }
          );
          if (searchResponse?.results) {
            fetchedMessages = searchResponse.results.map((res: any) => ({
              ...res.message,
              channel: res.channel,
            }));
          }
        } catch (searchErr) {
          console.warn(
            "Stream search API failed or not indexed, falling back to local client state:",
            searchErr
          );

          const localMessages: any[] = [];
          Object.values(client.activeChannels).forEach((channel) => {
            if (channel.state?.pinnedMessages) {
              channel.state.pinnedMessages.forEach((msg) => {
                localMessages.push({
                  ...msg,
                  channel: {
                    id: channel.id,
                    type: channel.type,
                    data: channel.data,
                    state: channel.state,
                  },
                });
              });
            }
          });

          localMessages.sort((a, b) => {
            const dateA = new Date(a.pinned_at || a.created_at).getTime();
            const dateB = new Date(b.pinned_at || b.created_at).getTime();
            return dateB - dateA;
          });
          fetchedMessages = localMessages;
        }

        setFlagged(fetchedMessages);
      } catch (err) {
        console.error("Error loading flagged messages:", err);
        setError("Failed to load flagged messages.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFlaggedMessages();
  }, [isOpen, client]);

  if (!isOpen) return null;

  const handleUnflag = async (message: any) => {
    try {
      await client.unpinMessage(message);
      setFlagged((prev) => prev.filter((msg) => msg.id !== message.id));
    } catch (err) {
      console.error("Error unpinning message:", err);
      alert("Failed to unflag message.");
    }
  };

  const handleGoToChat = (message: any) => {
    if (onSelectChannel) {
      const channelId = message.channel?.id || message.cid?.split(":")[1];
      if (channelId) {
        onSelectChannel(channelId);
      }
    }
    onClose();
  };

  const getMessageText = (message: any) => {
    if (message.text) return message.text;
    if (message.attachments && message.attachments.length > 0) {
      const types = message.attachments.map((a: any) => a.type).join(", ");
      return `[Sent attachment: ${types}]`;
    }
    return "[Empty message]";
  };

  const getChannelName = (channel: any) => {
    if (channel?.data?.name) return channel.data.name;

    if (channel?.state?.members) {
      const otherMembers = Object.values(channel.state.members)
        .filter((m: any) => m.user_id !== client.userID)
        .map((m: any) => m.user?.name || m.user_id);
      if (otherMembers.length > 0) {
        return otherMembers.join(", ");
      }
    }
    return "Direct Message";
  };

  const formatMessageTime = (dateStr: string) => {
    return formatRelativeTime(dateStr);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Container */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 p-6 text-foreground flex flex-col gap-4 animate-in fade-in-50 zoom-in-95 duration-200 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Flagged Messages</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[300px] max-h-[500px]">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm font-medium animate-pulse">Fetching flagged messages...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-destructive">
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : flagged.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground text-center gap-3 animate-in fade-in duration-300">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <MessageSquareOff className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-base">No flagged messages</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                  You can star/flag messages by pinning them in any conversation. Hover a message, click options, and pin it.
                </p>
              </div>
            </div>
          ) : (
            flagged.map((item) => (
              <div
                key={item.id}
                className="group border border-border/60 hover:border-border rounded-xl p-4 bg-muted/10 hover:bg-muted/20 flex flex-col gap-3 transition-all duration-200"
              >
                {/* Message Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={item.user?.image || ""} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">
                        {item.user?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-foreground">
                      {item.user?.name || "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatMessageTime(item.created_at)}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {getChannelName(item.channel)}
                  </span>
                </div>

                {/* Message Content */}
                <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed pl-1">
                  {getMessageText(item)}
                </p>

                {/* Actions Row */}
                <div className="flex items-center justify-end gap-2 mt-1 pt-2 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnflag(item)}
                    className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    Unflag
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleGoToChat(item)}
                    className="h-8 text-xs gap-1 rounded-lg shadow-xs"
                  >
                    Go to chat
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
