"use client";

import { logOut } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => logOut()}
      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
    >
      <LogOut size={13} />
      Sign out
    </button>
  );
}