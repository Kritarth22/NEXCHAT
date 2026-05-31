"use client";

import { useEffect, useState } from "react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageComposer,
  Window,
} from "stream-chat-react";
import ChatLayout from "./chat-layout";
import { MessageSquare } from "lucide-react";

type Props = {
  userId: string;
  userName: string;
  userImage?: string;
};

export default function ChatClient({
  userId,
  userName,
  userImage,
}: Props) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] =
    useState<StreamChannel | null>(null);

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/stream-token");
      const { token } = await res.json();

      const chatClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!
      );

      await chatClient.connectUser(
        {
          id: userId,
          name: userName,
          image: userImage,
        },
        token
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

  return (
    <ChatLayout
      userName={userName}
      userImage={userImage}
      onSelectUser={handleSelectUser}
    >
      <Chat client={client}>
        {activeChannel ? (
          <Channel channel={activeChannel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageComposer />
            </Window>
          </Channel>
        ) : (
          <div className="h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary/60" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold text-lg">
                No conversation selected
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Select a user from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </Chat>
    </ChatLayout>
  );
}