"use client";

import { useEffect, useState, useRef } from "react";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/providers/sidebar-provider";
import { cn } from "@/lib/utils";
import { StreamChat } from "stream-chat";
import ProfileModal from "./profile-modal";

type User = {
  id: string;
  name: string | null;
  image: string | null;
};

type Props = {
  userName: string;
  userImage?: string;
  userStatus?: string;
  onSelectUser: (userId: string) => void;
  activeUserId?: string | null;
  onUpdateUserImage?: (imageUrl: string) => void;
  onUpdateUserName?: (name: string) => void;
  onUpdateUserStatus?: (status: string) => void;
  client?: StreamChat | null;
};

export default function Sidebar({
  userName,
  userImage,
  userStatus,
  onSelectUser,
  activeUserId,
  onUpdateUserImage,
  onUpdateUserName,
  onUpdateUserStatus,
  client,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, setIsOpen } = useSidebar();

  // Own profile dialog state
  const [isOwnProfileOpen, setIsOwnProfileOpen] = useState(false);

  const handleUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/users/profile", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to upload");
    }

    const data = await res.json();
    const newImageUrl = data.imageUrl;

    if (onUpdateUserImage) {
      onUpdateUserImage(newImageUrl);
    }

    if (client && client.userID) {
      await client.updateUser({
        id: client.userID,
        name: userName,
        image: newImageUrl,
      });
    }

    return newImageUrl;
  };

  const handleSaveProfile = async (name: string, status: string) => {
    const res = await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    const data = await res.json();

    if (onUpdateUserName) {
      onUpdateUserName(data.name);
    }
    if (onUpdateUserStatus) {
      onUpdateUserStatus(data.status);
    }

    if (client && client.userID) {
      await client.updateUser({
        id: client.userID,
        name: data.name,
        image: userImage || undefined,
        status: data.status,
      } as any);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();

      setUsers(data);
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-80 transform flex-col border-r border-border bg-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex h-full",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              NEXCHAT
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="md:hidden h-9 w-9 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              id="close-sidebar-btn"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Current User */}
        <div 
          className="flex items-center gap-3 p-4 border-b border-border hover:bg-accent/40 cursor-pointer transition-colors duration-150 group/user"
          onClick={() => setIsOwnProfileOpen(true)}
        >
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 transition-all duration-300 group-hover/user:ring-primary/50 overflow-hidden relative shrink-0">
            <AvatarImage src={userImage || ""} alt={userName} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-foreground font-medium truncate group-hover/user:text-primary transition-colors">
              {userName}
            </p>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                userStatus === "online" ? "bg-chat-online" : "bg-muted-foreground/60"
              )} />
              <p className="text-muted-foreground text-xs capitalize">
                {userStatus || "online"}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-border"
              id="user-search-input"
            />
          </div>
        </div>

        {/* User List */}
        <ScrollArea className="flex-1">
          <div className="px-2">
            <p className="text-muted-foreground text-[11px] uppercase font-semibold tracking-wider px-2 py-2">
              Users
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                {filteredUsers.length}
              </Badge>
            </p>

            {filteredUsers.map((user) => {
              const isActive = activeUserId === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user.id);
                    setIsOpen(false); // Close sidebar on mobile
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 group",
                    isActive
                      ? "bg-accent text-primary"
                      : "hover:bg-accent"
                  )}
                  id={`user-item-${user.id}`}
                >
                  <Avatar className={cn("h-9 w-9", isActive && "ring-2 ring-primary/30")}>
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      {user.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-left flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate transition-colors",
                      isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                      {user.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {isActive ? "Active conversation" : "Start chatting"}
                    </p>
                  </div>

                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              );
            })}

            {filteredUsers.length === 0 && searchQuery && (
              <p className="text-muted-foreground text-sm text-center py-8">
                No users found
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <LogoutButton />
        </div>
      </div>

      {/* Own Profile Edit Modal */}
      <ProfileModal
        isOpen={isOwnProfileOpen}
        onClose={() => setIsOwnProfileOpen(false)}
        userId={client?.userID || ""}
        userName={userName}
        userImage={userImage}
        userStatus={userStatus}
        isReadOnly={false}
        onSave={handleSaveProfile}
        onUploadImage={handleUploadImage}
      />
    </>
  );
}