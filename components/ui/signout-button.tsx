// components/ui/signout-button.tsx
"use client";

import { logOut } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => logOut()}
      className="flex items-center gap-1.5 text-xs transition-all hover:opacity-100 opacity-50"
      style={{ color: "var(--text-2)" }}
    >
      <LogOut size={13} />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
