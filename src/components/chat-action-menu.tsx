/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Channel as StreamChannel } from "stream-chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Flag, Trash2, Eraser } from "lucide-react";
import FlaggedMessagesModal from "./flagged-messages-modal";

type ChatActionMenuProps = {
  channel: StreamChannel;
  onClearActiveChannel?: () => void;
  onSelectChannel?: (channelId: string) => void;
};

export default function ChatActionMenu({
  channel,
  onClearActiveChannel,
  onSelectChannel,
}: ChatActionMenuProps) {
  const [isFlaggedOpen, setIsFlaggedOpen] = useState(false);
  const client = channel.getClient();
  const currentUserId = client.userID;

  const members = Object.values(channel.state.members || {});
  const isGroup = (channel.data as any)?.isGroup || (channel.data as any)?.name || members.length > 2;

  // Determine if the current user is an admin of the group chat
  const createdById = (channel.data as any)?.created_by_id || (channel.data as any)?.created_by?.id;
  const adminIds = (channel.data as any)?.admin_ids || [];
  const singleAdminId = (channel.data as any)?.admin_id;
  const isCurrentUserAdmin = currentUserId && (
    adminIds.includes(currentUserId) ||
    currentUserId === singleAdminId ||
    currentUserId === createdById
  );

  const handleDeleteGroup = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this group permanently? This action cannot be undone for all members."
    );
    if (!confirmDelete) return;

    try {
      await channel.delete();
      if (onClearActiveChannel) {
        onClearActiveChannel();
      }
    } catch (err: any) {
      console.error("Error deleting group:", err);
      alert(err.message || "Failed to delete group.");
    }
  };

  const handleClearChat = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear this chat history? The chat will be hidden and messages cleared from your view."
    );
    if (!confirmClear) return;

    try {
      await (channel as any).hide(null, true);
      if (onClearActiveChannel) {
        onClearActiveChannel();
      }
    } catch (err: any) {
      console.error("Error clearing chat:", err);
      alert(err.message || "Failed to clear chat history.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
            id="chat-action-menu-btn"
          >
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">Chat options</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[180px]">
          {isGroup ? (
            <>
              {/* Delete Group (Admin only) */}
              {isCurrentUserAdmin && (
                <DropdownMenuItem
                  onClick={handleDeleteGroup}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  id="menu-delete-group"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Group</span>
                </DropdownMenuItem>
              )}

              {/* Flagged Messages */}
              <DropdownMenuItem
                onClick={() => setIsFlaggedOpen(true)}
                className="flex items-center gap-2 cursor-pointer"
                id="menu-group-flagged"
              >
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span>Flagged Messages</span>
              </DropdownMenuItem>

              {/* Clear Chat */}
              <DropdownMenuItem
                onClick={handleClearChat}
                className="flex items-center gap-2 cursor-pointer"
                id="menu-group-clear"
              >
                <Eraser className="h-4 w-4 text-muted-foreground" />
                <span>Clear Chat</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {/* Clear Chat */}
              <DropdownMenuItem
                onClick={handleClearChat}
                className="flex items-center gap-2 cursor-pointer"
                id="menu-personal-clear"
              >
                <Eraser className="h-4 w-4 text-muted-foreground" />
                <span>Clear Chat</span>
              </DropdownMenuItem>

              {/* Flagged Messages */}
              <DropdownMenuItem
                onClick={() => setIsFlaggedOpen(true)}
                className="flex items-center gap-2 cursor-pointer"
                id="menu-personal-flagged"
              >
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span>Flagged Messages</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <FlaggedMessagesModal
        isOpen={isFlaggedOpen}
        onClose={() => setIsFlaggedOpen(false)}
        client={client}
        channelId={channel.id}
        onSelectChannel={onSelectChannel}
      />
    </>
  );
}
