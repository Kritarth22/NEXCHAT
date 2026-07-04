"use client";

import { useState } from "react";
import { StreamChat } from "stream-chat";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Flag, Moon, Sun, Monitor, Users } from "lucide-react";
import CreateGroupModal from "./create-group-modal";
import FlaggedMessagesModal from "./flagged-messages-modal";

type ActionMenuProps = {
  client?: StreamChat | null;
  onSelectChannel?: (channelId: string) => void;
};

export default function ActionMenu({ client, onSelectChannel }: ActionMenuProps) {
  const { theme, setTheme } = useTheme();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isFlaggedOpen, setIsFlaggedOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
            id="action-menu-btn"
          >
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[180px]">
          {/* Flagged Messages */}
          <DropdownMenuItem
            onClick={() => setIsFlaggedOpen(true)}
            className="flex items-center gap-2 cursor-pointer"
            id="menu-flagged-messages"
          >
            <Flag className="h-4 w-4 text-muted-foreground" />
            <span>Flagged Messages</span>
          </DropdownMenuItem>

          {/* Create Group */}
          {client && (
            <DropdownMenuItem
              onClick={() => setIsCreateGroupOpen(true)}
              className="flex items-center gap-2 cursor-pointer"
              id="menu-create-group"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Create Group</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Submenu for Dark/Light Mode */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-[120px]">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center gap-2 cursor-pointer"
                id="menu-theme-light"
              >
                <Sun className="h-4 w-4 text-muted-foreground" />
                <span>Light</span>
                {theme === "light" && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2 cursor-pointer"
                id="menu-theme-dark"
              >
                <Moon className="h-4 w-4 text-muted-foreground" />
                <span>Dark</span>
                {theme === "dark" && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex items-center gap-2 cursor-pointer"
                id="menu-theme-system"
              >
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span>System</span>
                {theme === "system" && <span className="ml-auto text-xs text-primary font-bold">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      {client && (
        <>
          <CreateGroupModal
            isOpen={isCreateGroupOpen}
            onClose={() => setIsCreateGroupOpen(false)}
            client={client}
            onSelectChannel={onSelectChannel}
          />
          <FlaggedMessagesModal
            isOpen={isFlaggedOpen}
            onClose={() => setIsFlaggedOpen(false)}
            client={client}
            onSelectChannel={onSelectChannel}
          />
        </>
      )}
    </>
  );
}
