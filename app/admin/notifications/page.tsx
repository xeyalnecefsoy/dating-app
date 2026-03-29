"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  ADMIN_NOTIFICATIONS_MAX_AGE_DAYS,
  formatAzDateTime,
  reportReasonLabelAz,
} from "@/lib/formatAz";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  ChevronRight,
  Flag,
  Loader2,
  MessageSquare,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FOUNDER_EMAIL = "xeyalnecefsoy@gmail.com";

function notifIcon(type: string) {
  const t = (type || "").toLowerCase();
  if (t === "message") return MessageSquare;
  if (t === "match") return UserPlus;
  return Bell;
}

export default function AdminNotificationsFullPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { isLoading: isConvexAuthLoading, isAuthenticated: isConvexAuthenticated } =
    useConvexAuth();

  const normalizedRole = (user?.role || "").toLowerCase();
  const normalizedUserEmail = (user?.email || "").toLowerCase();
  const isFounder = normalizedUserEmail === FOUNDER_EMAIL;
  const isAdminUser =
    !!user && (normalizedRole === "admin" || normalizedRole === "superadmin" || isFounder);

  const adminEmail = normalizedUserEmail || FOUNDER_EMAIL;
  const canLoad =
    !isUserLoading && !isConvexAuthLoading && isConvexAuthenticated && isAdminUser;

  const feed = useQuery(
    api.admin.getAdminNotificationFeed,
    canLoad
      ? {
          adminEmail,
          notificationLimit: 80,
          notificationMaxAgeDays: ADMIN_NOTIFICATIONS_MAX_AGE_DAYS,
          reportPreviewLimit: 25,
          recentActivityLimit: 20,
        }
      : "skip"
  );

  const ageDays =
    feed?.notificationMaxAgeDays ?? ADMIN_NOTIFICATIONS_MAX_AGE_DAYS;

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  React.useEffect(() => {
    if (!isUserLoading && !isAdminUser) {
      router.replace("/");
    }
  }, [isUserLoading, isAdminUser, router]);

  const handleNotificationClick = async (n: {
    _id: string;
    read: boolean;
    data?: { url?: string };
  }) => {
    if (!n.read) {
      try {
        await markAsRead({ notificationId: n._id as Id<"notifications"> });
      } catch {
        /* ignore */
      }
    }
    const url = n.data?.url;
    if (typeof url === "string") {
      const u = url.toLowerCase();
      if (u.includes("tab=reports")) {
        router.push("/admin?section=reports&reportsFilter=pending");
        return;
      }
      if (u.includes("tab=waitlist") || u.includes("verification")) {
        router.push("/admin?section=verification");
        return;
      }
      if (url.startsWith("/")) {
        router.push(url);
      }
    }
  };

  if (!isUserLoading && !isAdminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/admin" aria-label="Admin panelə qayıt">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="min-w-0 flex-1 text-center text-base font-semibold truncate">
            Admin bildirişləri
          </h1>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            title="Hamısını oxunmuş kimi işarələ"
            onClick={() => void markAllAsRead()}
          >
            <CheckCheck className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        <p className="mx-auto max-w-3xl px-4 pb-3 text-center text-xs text-muted-foreground">
          Şikayət, təsdiq və bu hesaba düşən bildirişlər. Bildiriş siyahısı son{" "}
          <span className="font-medium text-foreground">{ageDays}</span> gün və ən çox 80 qeydlə
          məhdudlaşır; köhnə qeydlər burada göstərilmir.
        </p>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6 pb-16">
        {feed === undefined ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : feed === null ? (
          <p className="text-center text-sm text-muted-foreground">Məlumat əlçatan deyil.</p>
        ) : (
          <>
            {(feed.pendingReportsCount > 0 || feed.pendingVerificationsCount > 0) && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gözləyən işlər
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {feed.pendingReportsCount > 0 && (
                    <Link
                      href="/admin?section=reports&reportsFilter=pending"
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-500">
                        <Flag className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">Şikayətlər</p>
                        <p className="text-sm text-muted-foreground">
                          {feed.pendingReportsCount} gözləyən
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </Link>
                  )}
                  {feed.pendingVerificationsCount > 0 && (
                    <Link
                      href="/admin?section=verification"
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-500">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">Təsdiq növbəsi</p>
                        <p className="text-sm text-muted-foreground">
                          {feed.pendingVerificationsCount} gözləyən
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </Link>
                  )}
                </div>
              </section>
            )}

            {feed.pendingReportsPreview.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Son şikayətlər
                </h2>
                <div className="space-y-2 rounded-2xl border border-border bg-card divide-y divide-border">
                  {feed.pendingReportsPreview.map((r) => (
                    <Link
                      key={String(r._id)}
                      href="/admin?section=reports&reportsFilter=pending"
                      className="block px-4 py-3 first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/40"
                    >
                      <p className="font-medium">{reportReasonLabelAz(String(r.reason))}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.reporterName} → {r.reportedName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                        {formatAzDateTime(r.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Bildirişlər
              </h2>
              {feed.notifications.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Hələ bildiriş yoxdur.
                </p>
              ) : (
                <div className="space-y-2">
                  {feed.notifications.map((n) => {
                    const Icon = notifIcon(n.type);
                    return (
                      <button
                        key={n._id}
                        type="button"
                        onClick={() => void handleNotificationClick(n)}
                        className={cn(
                          "flex w-full gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/40",
                          !n.read && "border-primary/20 bg-primary/5"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted",
                            !n.read && "ring-1 ring-primary/30"
                          )}
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug">{n.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground break-words">
                            {n.body}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                            {formatAzDateTime(n.createdAt ?? n._creationTime)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {feed.recentActivity.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Son qeydiyyatlar / hadisələr
                </h2>
                <div className="space-y-2 rounded-2xl border border-border bg-card p-2">
                  {feed.recentActivity.map((a) => (
                    <div
                      key={String(a.id)}
                      className="rounded-xl px-3 py-2 text-sm border border-transparent hover:bg-muted/30"
                    >
                      <span className="font-medium break-words">{a.userName}</span>
                      <span className="text-muted-foreground"> — {a.actionText}</span>
                      <p className="mt-1 text-xs text-muted-foreground">{a.timeAgo}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="flex justify-center pt-2">
              <Button variant="outline" asChild>
                <Link href="/admin">Admin panelə qayıt</Link>
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
