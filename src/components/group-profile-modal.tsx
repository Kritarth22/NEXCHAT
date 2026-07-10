/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { Channel as StreamChannel } from "stream-chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Camera,
  Loader2,
  Search,
  UserPlus,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  name: string | null;
  image: string | null;
  status?: string;
};

type GroupProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  channel: StreamChannel;
};

export default function GroupProfileModal({
  isOpen,
  onClose,
  channel,
}: GroupProfileModalProps) {
  const [tempName, setTempName] = useState("");
  const [tempImage, setTempImage] = useState<string | undefined>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Available users to add (non-members)
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens or channel changes
  useEffect(() => {
    if (isOpen) {
      setTempName((channel.data as any)?.name || "Unnamed Group");
      setTempImage((channel.data as any)?.image);
      setIsPreviewOpen(false);
      setSelectedUserIds([]);
      setSearchQuery("");
      setIsAddOpen(false);
      setIsMembersOpen(true);

      const fetchAvailableUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const res = await fetch("/api/users");
          const data = await res.json();
          // Filter out users who are already members
          const memberIds = new Set(Object.keys(channel.state.members || {}));
          const filtered = data.filter((u: User) => !memberIds.has(u.id));
          setAvailableUsers(filtered);
        } catch (err) {
          console.error("Error fetching users:", err);
        } finally {
          setIsLoadingUsers(false);
        }
      };

      fetchAvailableUsers();
    }
  }, [isOpen, channel]);

  if (!isOpen) return null;

  const currentMembers = Object.values(channel.state.members || {});

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening preview
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/groups/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload");
      }

      const data = await res.json();
      setTempImage(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempName || tempName.trim() === "") {
      alert("Group name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      const nameChanged = tempName.trim() !== ((channel.data as any)?.name || "");
      const imageChanged = tempImage !== (channel.data as any)?.image;

      if (nameChanged || imageChanged) {
        await channel.update({
          name: tempName.trim(),
          image: tempImage,
        } as any);
      }

      if (selectedUserIds.length > 0) {
        await channel.addMembers(selectedUserIds);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update group profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAvailableUsers = availableUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => !isSaving && onClose()}
      />

      {/* Dialog Container */}
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-6 text-foreground flex flex-col gap-4 animate-in fade-in-50 zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Group Info</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={isSaving}
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Avatar edit/view section */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20">
              <Avatar
                className="h-20 w-20 ring-4 ring-primary/10 transition-all duration-300 overflow-hidden relative cursor-pointer hover:ring-primary/30"
                onClick={() => setIsPreviewOpen(true)}
              >
                <AvatarImage src={tempImage || ""} alt={tempName} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {tempName.charAt(0).toUpperCase()}
                </AvatarFallback>
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </Avatar>

              {/* Edit Photo Icon Badge */}
              {!isUploading && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full hover:scale-105 transition-transform shadow-md z-10 border-2 border-card"
                  title="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading || isSaving}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              Click photo to preview
            </span>
          </div>

          {/* Group Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Group Name
            </label>
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter group name"
              className="bg-muted/50 border-border h-10 text-sm"
              disabled={isSaving}
              required
            />
          </div>

          {/* Current Members Section (Collapsible) */}
          <div className="border border-border rounded-xl overflow-hidden bg-muted/10">
            <button
              type="button"
              onClick={() => setIsMembersOpen(!isMembersOpen)}
              className="w-full flex items-center justify-between p-3 text-sm font-semibold hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Group Members ({currentMembers.length})</span>
              </div>
              {isMembersOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isMembersOpen && (
              <div className="p-2 border-t border-border bg-card divide-y divide-border/40 max-h-[160px] overflow-y-auto">
                {currentMembers.map((member) => {
                  const user = member.user;
                  if (!user) return null;
                  const isOnline = user.online && (user as any).status !== "offline";
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-2 px-2 hover:bg-accent/20 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.image as string || ""} alt={user.name || ""} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium truncate text-foreground">
                            {/* {user.name} */}
                            {user.id === channel.getClient().userID ? "You" : user.name}
                          </span>
                          {/* <span className="text-[9px] text-muted-foreground truncate">
                            {user.id === channel.getClient().userID ? "You" : ""}
                          </span> */}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isOnline ? "bg-chat-online animate-pulse" : "bg-muted-foreground/60"
                          )}
                        />
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Members Section (Collapsible) */}
          <div className="border border-border rounded-xl overflow-hidden bg-muted/10">
            <button
              type="button"
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="w-full flex items-center justify-between p-3 text-sm font-semibold hover:bg-accent/40 transition-colors"
            >
              <div className="flex items-center gap-2 text-foreground">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span>Add Members {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}</span>
              </div>
              {isAddOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isAddOpen && (
              <div className="p-3 border-t border-border bg-card space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 bg-muted/50 border-border text-xs"
                    disabled={isSaving}
                  />
                </div>

                <div className="border border-border rounded-lg bg-muted/10 divide-y divide-border/40 max-h-[160px] overflow-y-auto">
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground text-xs">
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Loading users...
                    </div>
                  ) : filteredAvailableUsers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-xs">
                      No users available
                    </div>
                  ) : (
                    filteredAvailableUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleUserSelection(user.id)}
                          disabled={isSaving}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-2 hover:bg-accent/40 transition-colors text-left",
                            isSelected && "bg-primary/5"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={user.image || ""} alt={user.name || ""} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                                {user.name?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-foreground">{user.name}</span>
                          </div>

                          <div
                            className={cn(
                              "h-4 w-4 rounded border border-input flex items-center justify-center transition-all",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-background"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isSaving}
              onClick={onClose}
              className="rounded-lg h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded-lg h-9 text-sm font-semibold shadow-sm px-4"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>

        {/* Image Preview Overlay inside Dialog */}
        {isPreviewOpen && (
          <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative max-w-full max-h-[70%] aspect-square flex items-center justify-center">
              {tempImage ? (
                <img
                  src={tempImage}
                  alt="Group Icon Preview"
                  className="w-56 h-56 rounded-xl object-cover border border-white/10 shadow-2xl"
                />
              ) : (
                <div className="w-56 h-56 rounded-xl bg-primary/10 border border-white/10 flex items-center justify-center text-primary text-5xl font-bold">
                  {tempName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-white/60 text-xs mt-4 font-medium">
              Group Icon Preview
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
