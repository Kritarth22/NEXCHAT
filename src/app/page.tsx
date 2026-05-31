import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { MessageSquare, LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4 border-border shadow-xl">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Welcome to CHATAPP
              </h1>
              <p className="text-muted-foreground mt-2">
                Sign in to start chatting with your friends
              </p>
            </div>

            <Button asChild className="w-full gap-2" size="lg">
              <a href="/api/auth/signin">
                <LogIn className="h-4 w-4" />
                Sign In
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-border shadow-xl">
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome, {session.user?.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {session.user?.email}
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button asChild className="w-full gap-2" size="lg">
              <Link href="/chat">
                <MessageSquare className="h-4 w-4" />
                Open Chat
              </Link>
            </Button>

            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}