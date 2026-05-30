import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatClient from "@/components/chat-client";

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <ChatClient
      userId={session.user.id}
      userName={session.user.name || "User"}
      userImage={session.user.image || undefined}
    />
  );
}