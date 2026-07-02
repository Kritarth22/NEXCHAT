import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-[30%] right-[15%] w-[200px] h-[200px] rounded-full bg-accent/20 blur-2xl animate-pulse [animation-delay:2s]" />

        {/* Theme toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md mx-4 border-border/50 shadow-2xl backdrop-blur-sm bg-card/80 relative z-10">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-8">
            {/* Logo */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                <MessageSquare className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-chat-online flex items-center justify-center shadow-sm">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Welcome to NEXCHAT
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                Connect with friends in real-time. Sign in to start your conversations.
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/chat" });
              }}
              className="w-full"
            >
              <Button type="submit" className="w-full gap-2 h-12 text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300" size="lg">
                <LogIn className="h-5 w-5" />
                Sign In with Google
              </Button>
            </form>

            <p className="text-muted-foreground/60 text-xs text-center">
              Secure authentication powered by NextAuth
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse [animation-delay:1s]" />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md mx-4 border-border/50 shadow-2xl backdrop-blur-sm bg-card/80 relative z-10">
        <CardContent className="pt-10 pb-10 flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
              <MessageSquare className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-chat-online flex items-center justify-center shadow-sm">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back, {session.user?.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {session.user?.email}
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button asChild className="w-full gap-2 h-12 text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300" size="lg">
              <Link href="/chat">
                <MessageSquare className="h-5 w-5" />
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