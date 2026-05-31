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
    return <div>Loading Chat...</div>;
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
          <div className="h-screen flex items-center justify-center text-zinc-400">
            Select a user to start chatting
          </div>
        )}
      </Chat>
    </ChatLayout>
  );
}