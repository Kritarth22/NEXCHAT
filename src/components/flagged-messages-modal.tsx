"use client";

import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, Flag, Loader2, ArrowRight, MessageSquareOff, ChevronLeft, ChevronRight } from "lucide-react";
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
  channelId?: string;          // when set, show only messages from this channel
  onSelectChannel?: (channelId: string) => void;
};

export default function FlaggedMessagesModal({
  isOpen,
  onClose,
  client,
  channelId,
  onSelectChannel,
}: FlaggedMessagesModalProps) {
  const [flagged, setFlagged] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const loadFlaggedMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let fetchedMessages: any[] = [];
        try {
          // If a specific channel is requested, scope the search to it
          const channelFilter = channelId
            ? { cid: { $eq: `messaging:${channelId}` } }
            : { members: { $in: [client.userID!] } };

          const searchResponse = await client.search(
            channelFilter,
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
          Object.values(client.activeChannels).forEach((ch) => {
            // When channelId is given, only pull from that channel
            if (channelId && ch.id !== channelId) return;
            if (ch.state?.pinnedMessages) {
              ch.state.pinnedMessages.forEach((msg) => {
                localMessages.push({
                  ...msg,
                  channel: {
                    id: ch.id,
                    type: ch.type,
                    data: ch.data,
                    state: ch.state,
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
  }, [isOpen, client, channelId]);

  if (!isOpen) return null;

  const handleUnflag = async (message: any) => {
    try {
      await client.unpinMessage(message);
      setFlagged((prev) => {
        const filtered = prev.filter((msg) => msg.id !== message.id);
        setCurrentIndex((currIndex) => {
          if (currIndex >= filtered.length) {
            return Math.max(0, filtered.length - 1);
          }
          return currIndex;
        });
        return filtered;
      });
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 top-70">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg relative z-10 text-foreground flex flex-col animate-in fade-in-50 slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[92svh] sm:max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight leading-none">Flagged Messages</h2>
              {!isLoading && !error && flagged.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {currentIndex + 1} of {flagged.length}
                </p>
              )}
            </div>
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

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">Fetching flagged messages...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-destructive gap-2">
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : flagged.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground text-center gap-3 px-6 animate-in fade-in duration-300">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                <MessageSquareOff className="h-7 w-7 text-muted-foreground/60" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-base">No flagged messages</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1.5 leading-relaxed">
                  Pin messages in any conversation to flag them for later. Hover a message, click the options menu, and select Pin.
                </p>
              </div>
            </div>
          ) : (
            /* Single message card */
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {(() => {
                const item = flagged[currentIndex];
                return (
                  <div className="border border-border/60 rounded-xl bg-muted/10 flex flex-col gap-0 overflow-hidden animate-in fade-in zoom-in-98 duration-150">
                    {/* Chat badge */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Flag className="h-2.5 w-2.5" />
                        {getChannelName(item.channel)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    {/* Sender row */}
                    <div className="flex items-center gap-2.5 px-4 pb-2">
                      <Avatar className="h-7 w-7 ring-1 ring-border">
                        <AvatarImage src={item.user?.image || ""} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px] font-semibold">
                          {item.user?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-foreground">
                        {item.user?.id === client.userID ? "You" : (item.user?.name || "Unknown")}
                      </span>
                    </div>

                    {/* Message body */}
                    <div className="px-4 pb-4">
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/40">
                        {getMessageText(item)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/50 bg-muted/5">
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
                        className="h-8 text-xs gap-1.5 rounded-lg"
                      >
                        Go to chat
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Navigation Footer — only when there are messages */}
        {!isLoading && !error && flagged.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 flex-shrink-0 bg-muted/5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className={cn(
                "h-9 gap-1.5 rounded-lg text-xs font-medium transition-all",
                currentIndex === 0 && "opacity-40 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Dot indicators — max 7 dots, scroll beyond that */}
            <div className="flex items-center gap-1.5">
              {flagged.slice(0, 7).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    i === currentIndex
                      ? "h-2 w-2 bg-primary"
                      : "h-1.5 w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  )}
                />
              ))}
              {flagged.length > 7 && (
                <span className="text-[10px] text-muted-foreground ml-1">+{flagged.length - 7}</span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.min(flagged.length - 1, i + 1))}
              disabled={currentIndex === flagged.length - 1}
              className={cn(
                "h-9 gap-1.5 rounded-lg text-xs font-medium transition-all",
                currentIndex === flagged.length - 1 && "opacity-40 cursor-not-allowed"
              )}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
