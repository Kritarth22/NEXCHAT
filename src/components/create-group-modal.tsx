"use client";

import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  name: string | null;
  image: string | null;
};

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: StreamChat;
  onSelectChannel?: (channelId: string) => void;
};

export default function CreateGroupModal({
  isOpen,
  onClose,
  client,
  onSelectChannel,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const res = await fetch("/api/users");
          const data = await res.json();
          // Filter out the current user
          const otherUsers = data.filter((u: User) => u.id !== client.userID);
          setUsers(otherUsers);
        } catch (err) {
          console.error("Error fetching users:", err);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
      // Reset state
      setGroupName("");
      setSelectedUserIds([]);
      setSearchQuery("");
    }
  }, [isOpen, client.userID]);

  if (!isOpen) return null;

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }
    if (selectedUserIds.length === 0) {
      alert("Please select at least one participant");
      return;
    }

    setIsCreating(true);
    try {
      const channelId = `group-${Math.random().toString(36).substring(2, 11)}`;
      const channel = client.channel("messaging", channelId, {
        name: groupName.trim(),
        members: [client.userID!, ...selectedUserIds],
        isGroup: true,
        admin_id: client.userID!,
      } as any);

      await channel.create();
      
      if (onSelectChannel) {
        onSelectChannel(channel.id!);
      }
      onClose();
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in duration-200"
        onClick={() => !isCreating && onClose()}
      />

      {/* Container */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-6 text-foreground flex flex-col gap-4 animate-in fade-in-50 zoom-in-95 duration-200 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Create Group Chat</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={isCreating}
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4 overflow-hidden">
          {/* Group Name input */}
          <div className="space-y-1.5 animate-in slide-in-from-bottom-2 duration-200">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Group Name
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Project Team, Family Chat"
              className="bg-muted/50 border-border h-10 text-sm"
              disabled={isCreating}
              required
            />
          </div>

          {/* Search participants */}
          <div className="space-y-2 flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select Participants ({selectedUserIds.length} selected)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/50 border-border text-sm"
                disabled={isCreating}
              />
            </div>

            {/* Scrollable list */}
            <div className="border border-border rounded-lg bg-muted/20 overflow-y-auto max-h-[220px] divide-y divide-border">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleUserSelection(user.id)}
                      disabled={isCreating}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent/50 transition-colors text-left",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || ""} alt={user.name || ""} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                      <div
                        className={cn(
                          "h-5 w-5 rounded-md border border-input flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background"
                        )}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3 stroke-current"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-2 animate-in slide-in-from-bottom-4 duration-200">
            <Button
              type="button"
              variant="ghost"
              disabled={isCreating}
              onClick={onClose}
              className="rounded-lg h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || selectedUserIds.length === 0}
              className="rounded-lg h-9 text-sm font-semibold shadow-sm px-4"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
