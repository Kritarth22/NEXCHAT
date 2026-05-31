"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button
      onClick={() => signOut()}
      variant="destructive"
      className="w-full gap-2"
      id="logout-btn"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}