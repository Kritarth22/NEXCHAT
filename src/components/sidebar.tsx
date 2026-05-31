"use client";

import { useEffect, useState } from "react";
import { LogoutButton } from "./logout-button";

type User = {
  id: string;
  name: string | null;
  image: string | null;
};

type Props = {
  userName: string;
  userImage?: string;
  onSelectUser: (userId: string) => void;
};

export default function Sidebar({
  userName,
  userImage,
  onSelectUser,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();

      setUsers(data);
    };

    loadUsers();
  }, []);

  return (
    <div className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col">
      <div className="p-5 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">
          CHATAPP
        </h1>
      </div>

      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <img
          src={userImage || ""}
          alt={userName}
          className="w-10 h-10 rounded-full"
        />

        <div>
          <p className="text-white font-medium">
            {userName}
          </p>

          <p className="text-zinc-400 text-sm">
            Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="text-zinc-500 text-xs uppercase px-4 py-3">
          Users
        </p>

        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition"
          >
            <img
              src={user.image || ""}
              alt={user.name || ""}
              className="w-10 h-10 rounded-full"
            />

            <div className="text-left">
              <p className="text-white">
                {user.name}
              </p>

              <p className="text-zinc-500 text-sm">
                Start chatting
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <LogoutButton />
      </div>
    </div>
  );
}