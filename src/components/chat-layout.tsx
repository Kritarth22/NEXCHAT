import Sidebar from "./sidebar";
import { useSidebar } from "@/providers/sidebar-provider";
import { StreamChat } from "stream-chat";

type Props = {
  children: React.ReactNode;
  userName: string;
  userImage?: string;
  userStatus?: string;
  onSelectUser: (userId: string) => void;
  onSelectChannel?: (channelId: string) => void;
  activeUserId?: string | null;
  activeChannelId?: string | null;
  onUpdateUserImage?: (imageUrl: string) => void;
  onUpdateUserName?: (name: string) => void;
  onUpdateUserStatus?: (status: string) => void;
  client?: StreamChat | null;
};

export default function ChatLayout({
  children,
  userName,
  userImage,
  userStatus,
  onSelectUser,
  onSelectChannel,
  activeUserId,
  activeChannelId,
  onUpdateUserImage,
  onUpdateUserName,
  onUpdateUserStatus,
  client,
}: Props) {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <div className="h-screen bg-background flex overflow-hidden relative w-full">
      {/* Backdrop for mobile devices */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <Sidebar
        userName={userName}
        userImage={userImage}
        userStatus={userStatus}
        onSelectUser={onSelectUser}
        onSelectChannel={onSelectChannel}
        activeUserId={activeUserId}
        activeChannelId={activeChannelId}
        onUpdateUserImage={onUpdateUserImage}
        onUpdateUserName={onUpdateUserName}
        onUpdateUserStatus={onUpdateUserStatus}
        client={client}
      />

      <div className="flex-1 flex flex-col bg-chat-bg overflow-hidden min-w-0 h-full">
        {children}
      </div>
    </div>
  );
}