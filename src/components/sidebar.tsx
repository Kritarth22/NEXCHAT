"use client";

import { useEffect, useState } from "react";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  image: string | null;
};

type Props = {
  userName: string;
  userImage?: string;
  onSelectUser: (userId: string) => void;
};

export default function Sidebar({
  userName,
  userImage,
  onSelectUser,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="w-80 border-r border-border bg-sidebar flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            CHATAPP
          </h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Current User */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarImage src={userImage || ""} alt={userName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-foreground font-medium truncate">
            {userName}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chat-online animate-pulse" />
            <p className="text-muted-foreground text-xs">
              Online
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

          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                         hover:bg-accent transition-colors duration-150 group"
              id={`user-item-${user.id}`}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="text-left flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {user.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  Start chatting
                </p>
              </div>
            </button>
          ))}

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
  );
}