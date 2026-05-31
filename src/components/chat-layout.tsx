import Sidebar from "./sidebar";

type Props = {
  children: React.ReactNode;
  userName: string;
  userImage?: string;
  onSelectUser: (userId: string) => void;
};

export default function ChatLayout({
  children,
  userName,
  userImage,
  onSelectUser,
}: Props) {
  return (
    <div className="h-screen bg-background flex">
      <Sidebar
        userName={userName}
        userImage={userImage}
        onSelectUser={onSelectUser}
      />

      <div className="flex-1 flex flex-col bg-chat-bg">
        {children}
      </div>
    </div>
  );
}