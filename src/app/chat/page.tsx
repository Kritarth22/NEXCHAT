import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatClient from "@/components/chat-client";
import { prisma } from "@/lib/prisma";

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      image: true,
      status: true,
    },
  });

  return (
    <ChatClient
      userId={session.user.id}
      userName={user?.name || session.user.name || "User"}
      userImage={user?.image || session.user.image || undefined}
      userStatus={user?.status || "online"}
    />
  );
}
