"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

export default function AccountRejectedPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">Müraciət təsdiqlənmədi</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Təəssüf ki, hazırda profiliniz platformaya qəbul edilmədi. İcma qaydalarına uyğun profil və şəkil
          tələb olunur.
        </p>
        {user?.profileModerationNote ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
            {user.profileModerationNote}
          </div>
        ) : null}
        <div className="flex flex-col gap-2 pt-4">
          <Link href="/icma-qaydalari">
            <Button variant="outline" className="w-full">
              İcma qaydaları
            </Button>
          </Link>
          <Button
            className="w-full"
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
          >
            Hesabdan çıx
          </Button>
        </div>
      </div>
    </div>
  );
}
