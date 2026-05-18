"use client";

import { useState } from "react";
import { verifyVaultPin } from "@/lib/actions/vault";
import { VaultLockScreen } from "@/components/vault/lock-screen";
import { VaultDbApp } from "@/components/vault/vault-db-app";

export function VaultClient({ profile, availableTeams }: { profile: any; availableTeams: any[] }) {
  const [unlocked, setUnlocked] = useState(false);

  async function handleUnlock(pin: string) {
    const result = await verifyVaultPin(pin);
    if (result.ok) setUnlocked(true);
    return result;
  }

  if (!unlocked) {
    return <VaultLockScreen onUnlock={handleUnlock} />;
  }

  return (
    <VaultDbApp
      profile={profile}
      availableTeams={availableTeams}
      onLock={() => setUnlocked(false)}
    />
  );
}
