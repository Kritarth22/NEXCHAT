"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
    >
      Logout
    </button>
  );
}