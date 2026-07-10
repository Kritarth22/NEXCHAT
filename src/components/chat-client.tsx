/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import {
  Chat,
  Channel,
  MessageList,
  MessageComposer,
  Window,
  Thread,
  useChannelStateContext,
  useTypingContext,
  useChannelPreviewInfo,
} from "stream-chat-react";
import ChatLayout from "./chat-layout";
import { MessageSquare, Menu, Users } from "lucide-react";
import { SidebarProvider, useSidebar } from "@/providers/sidebar-provider";
import { Button } from "@/components/ui/button";
import ActionMenu from "./action-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import ProfileModal from "./profile-modal";
import GroupProfileModal from "./group-profile-modal";

type Props = {
  userId: string;
  userName: string;
  userImage?: string;
  userStatus?: string;
};

function CustomChannelHeader() {
  const { toggle } = useSidebar();
  const { channel, channelConfig } = useChannelStateContext();
  const { typing = {} } = useTypingContext();
  const { displayImage, displayTitle } = useChannelPreviewInfo({ channel });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const currentUserId = channel?.getClient()?.userID;
  const typingArray = Object.values(typing).filter(
    ({ parent_id, user }) => !parent_id && user?.id !== currentUserId,
  );
  const isTyping =
    channelConfig?.typing_events !== false && typingArray.length > 0;

  const members = Object.values(channel?.state?.members || {});
  const isGroup = channel ? ((channel.data as any)?.isGroup || (channel.data as any)?.name || members.length > 2) : false;

  // Get the other user's info from channel members
  const otherMember = members.find(
    (m) => m.user_id !== channel?.getClient()?.userID,
  );
  const otherUser = otherMember?.user;
  const isOtherUserOnline =
    otherUser?.online && (otherUser as any)?.status !== "offline";

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/85 backdrop-blur-md z-10 w-full h-[60px] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Menu Toggle for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="md:hidden -ml-2 h-9 w-9 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
            id="mobile-sidebar-toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* User Info — Clickable to open profile */}
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsProfileOpen(true)}
          >
            <Avatar className="h-9 w-9 ring-2 ring-primary/10">
              <AvatarImage src={displayImage || ""} alt={displayTitle || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {displayTitle?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-sm truncate leading-tight">
                {displayTitle}
              </span>
              <span className="text-[11px] text-muted-foreground truncate leading-tight flex items-center gap-1 mt-0.5">
                {isTyping ? (
                  <span className="text-primary font-medium animate-pulse">
                    typing...
                  </span>
                ) : isGroup ? (
                  <>
                    <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span>{members.length} members</span>
                  </>
                ) : (
                  <>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${!isOtherUserOnline ? "bg-muted-foreground/60" : "bg-chat-online"}`}
                    />
                    <span className="capitalize">
                      {!isOtherUserOnline ? "Offline" : "Online"}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ActionMenu client={channel?.getClient() || null} />
        </div>
      </div>

      {/* Render appropriate profile modal */}
      {isGroup ? (
        <GroupProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          channel={channel}
        />
      ) : (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userId={otherUser?.id || ""}
          userName={otherUser?.name || displayTitle || "Unknown"}
          userImage={otherUser?.image as string | undefined}
          userStatus={(otherUser as any)?.status || "online"}
          isReadOnly={true}
        />
      )}
    </>
  );
}

function ChatClientContent({ userId, userName, userImage, userStatus }: Props) {
  const [currentUserImage, setCurrentUserImage] = useState(userImage);
  const [currentUserName, setCurrentUserName] = useState(userName);
  const [currentUserStatus, setCurrentUserStatus] = useState(
    userStatus || "online",
  );
  const [client, setClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(
    null,
  );
  const { toggle } = useSidebar();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/stream-token");
      const { token } = await res.json();

      const chatClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      );

      await chatClient.connectUser(
        {
          id: userId,
          name: currentUserName,
          image: currentUserImage,
          status: currentUserStatus,
        } as any,
        token,
      );

      setClient(chatClient);
    };

    init();

    return () => {
      client?.disconnectUser();
    };
  }, []);

  const handleSelectUser = async (otherUserId: string) => {
    if (!client) return;

    const channel = client.channel("messaging", {
      members: [userId, otherUserId],
    });

    await channel.watch();

    setActiveChannel(channel);
  };

  const handleSelectChannel = async (channelId: string) => {
    if (!client) return;

    const channel = client.channel("messaging", channelId);
    await channel.watch();
    setActiveChannel(channel);
  };

  if (!client) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">
            Connecting to chat...
          </p>
        </div>
      </div>
    );
  }

  const activeUserId = activeChannel
    ? Object.values(activeChannel.state.members).find(
        (m) => m.user_id !== userId,
      )?.user_id
    : null;

  return (
    <ChatLayout
      userName={currentUserName}
      userImage={currentUserImage}
      userStatus={currentUserStatus}
      onSelectUser={handleSelectUser}
      onSelectChannel={handleSelectChannel}
      activeUserId={activeUserId}
      activeChannelId={activeChannel?.id || null}
      onUpdateUserImage={setCurrentUserImage}
      onUpdateUserName={setCurrentUserName}
      onUpdateUserStatus={setCurrentUserStatus}
      client={client}
    >
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${resolvedTheme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"}`}
      >
        <Chat client={client}>
          {activeChannel ? (
            <Channel channel={activeChannel}>
              <Window>
                <CustomChannelHeader />
                <MessageList />
                <MessageComposer />
              </Window>
              <Thread />
            </Channel>
          ) : (
            <div className="h-screen flex flex-col bg-chat-bg w-full">
              {/* Header for Mobile when no conversation is selected */}
              <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/85 backdrop-blur-md h-[60px] z-10 w-full flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    className="rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground h-9 w-9"
                    id="mobile-no-conv-toggle"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <span className="font-semibold text-foreground text-sm">
                    NEXCHAT
                  </span>
                </div>
                <ActionMenu client={client} onSelectChannel={handleSelectChannel} />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground p-6">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                  <MessageSquare className="h-8 w-8 text-primary/60" />
                </div>
                <div className="text-center max-w-sm">
                  <p className="text-foreground font-semibold text-lg">
                    No conversation selected
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Select a user from the sidebar to start chatting
                  </p>
                  <Button
                    onClick={toggle}
                    className="mt-4 md:hidden gap-2 shadow-sm rounded-lg"
                    size="sm"
                  >
                    <Menu className="h-4 w-4" />
                    Open User List
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Chat>
      </div>
    </ChatLayout>
  );
}

export default function ChatClient(props: Props) {
  return (
    <SidebarProvider>
      <ChatClientContent {...props} />
    </SidebarProvider>
  );
}
