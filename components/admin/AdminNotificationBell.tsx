"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  ADMIN_NOTIFICATIONS_MAX_AGE_DAYS,
  formatAzDateTime,
  reportReasonLabelAz,
} from "@/lib/formatAz";
import {
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

type ReportFilter = "all" | "pending" | "resolved" | "dismissed";

type Props = {
  adminEmail: string;
  canLoad: boolean;
  setActiveSection: (id: string) => void;
  setReportStatusFilter: (f: ReportFilter) => void;
  setIsSidebarOpen: (open: boolean) => void;
};

function notifIcon(type: string) {
  const t = (type || "").toLowerCase();
  if (t === "message") return MessageSquare;
  if (t === "match") return UserPlus;
  return Bell;
}

export function AdminNotificationBell({
  adminEmail,
  canLoad,
  setActiveSection,
  setReportStatusFilter,
  setIsSidebarOpen,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 352 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const feed = useQuery(
    api.admin.getAdminNotificationFeed,
    canLoad
      ? {
          adminEmail,
          notificationLimit: 25,
          notificationMaxAgeDays: ADMIN_NOTIFICATIONS_MAX_AGE_DAYS,
        }
      : "skip"
  );
  const unreadFast = useQuery(
    api.notifications.getUnreadCount,
    canLoad ? undefined : "skip"
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const unread =
    feed?.unreadNotifications !== undefined
      ? feed.unreadNotifications
      : (unreadFast ?? 0);

  const pendingReports = feed?.pendingReportsCount ?? 0;
  const pendingVerifications = feed?.pendingVerificationsCount ?? 0;
  const hasQueueWork = pendingReports > 0 || pendingVerifications > 0;

  const showCountBadge = unread > 0;
  const showDot =
    !showCountBadge && hasQueueWork;

  const updatePanelPosition = React.useCallback(() => {
    const anchor = rootRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const margin = 12;
    const maxW = 352;
    const w = Math.min(maxW, window.innerWidth - margin * 2);
    const left = Math.min(
      Math.max(margin, r.right - w),
      window.innerWidth - w - margin
    );
    const top = r.bottom + 8;
    setPanelPos({ top, left, width: w });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const goReports = (filter: ReportFilter) => {
    setReportStatusFilter(filter);
    setActiveSection("reports");
    setIsSidebarOpen(false);
    setOpen(false);
  };

  const goVerification = () => {
    setActiveSection("verification");
    setIsSidebarOpen(false);
    setOpen(false);
  };

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
        goReports("pending");
        return;
      }
      if (u.includes("tab=waitlist") || u.includes("verification")) {
        goVerification();
        return;
      }
      if (url.startsWith("/")) {
        setOpen(false);
        router.push(url);
        return;
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch {
      /* ignore */
    }
  };

  const panelContent = (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: panelPos.top,
        left: panelPos.left,
        width: panelPos.width,
        zIndex: 200,
        maxHeight: "min(70vh, 540px)",
      }}
      className="flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      role="dialog"
      aria-label="Admin bildiriş paneli"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2 shrink-0 bg-card">
        <div className="min-w-0">
          <p className="font-semibold text-sm">Admin bildirişləri</p>
          <p className="text-[11px] text-muted-foreground">
            Son {feed?.notificationMaxAgeDays ?? ADMIN_NOTIFICATIONS_MAX_AGE_DAYS} gün · şikayət,
            növbə, hadisə
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          title="Bildirişləri oxunmuş kimi işarələ"
          onClick={() => void handleMarkAllRead()}
        >
          <CheckCheck className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain max-h-[min(48vh,380px)] px-3 py-3">
        <div className="space-y-4 pb-1">
          {feed === undefined ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : feed === null ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              Məlumat əlçatan deyil.
            </p>
          ) : (
            <>
              {(pendingReports > 0 || pendingVerifications > 0) && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Gözləyən işlər
                  </p>
                  {pendingReports > 0 && (
                    <button
                      type="button"
                      onClick={() => goReports("pending")}
                      className="w-full flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-left hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-500">
                        <Flag className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Şikayətlər</p>
                        <p className="text-xs text-muted-foreground">
                          {pendingReports} gözləyən şikayət
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  )}
                  {pendingVerifications > 0 && (
                    <button
                      type="button"
                      onClick={goVerification}
                      className="w-full flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-left hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-500">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Təsdiq növbəsi</p>
                        <p className="text-xs text-muted-foreground">
                          {pendingVerifications} gözləyən təsdiq
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  )}
                </div>
              )}

              {feed.pendingReportsPreview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Son şikayətlər
                  </p>
                  <div className="space-y-1.5">
                    {feed.pendingReportsPreview.map((r) => (
                      <button
                        key={String(r._id)}
                        type="button"
                        onClick={() => goReports("pending")}
                        className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-muted/60 transition-colors"
                      >
                        <p className="text-xs font-medium">
                          {reportReasonLabelAz(String(r.reason))}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {r.reporterName} → {r.reportedName}
                        </p>
                        <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                          {formatAzDateTime(r.createdAt)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Gələn bildirişlər
                </p>
                {feed.notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 px-1">
                    Bildiriş yoxdur. Gözləyən işlər yuxarıda.
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {feed.notifications.map((n) => {
                      const Icon = notifIcon(n.type);
                      return (
                        <button
                          key={n._id}
                          type="button"
                          onClick={() => void handleNotificationClick(n)}
                          className={cn(
                            "w-full flex gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted/60 transition-colors",
                            !n.read && "bg-primary/5"
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted",
                              !n.read && "ring-1 ring-primary/30"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium leading-snug line-clamp-2">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 break-words">
                              {n.body}
                            </p>
                            <p className="text-[10px] text-muted-foreground tabular-nums mt-1">
                              {formatAzDateTime(
                                n.createdAt ?? n._creationTime
                              )}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {feed.recentActivity.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Son hadisələr
                  </p>
                  <div className="space-y-1.5">
                    {feed.recentActivity.map((a) => (
                      <div
                        key={String(a.id)}
                        className="rounded-lg px-2 py-1.5 text-xs border border-border/60 bg-muted/20"
                      >
                        <span className="font-medium break-words">{a.userName}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          — {a.actionText}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {a.timeAgo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card p-3 flex flex-col gap-2">
        <Button variant="outline" size="sm" className="h-9 w-full text-xs justify-center" asChild>
          <Link href="/admin/notifications" onClick={() => setOpen(false)}>
            Bütün bildirişlər
          </Link>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-9 w-full text-xs"
          onClick={() => {
            setActiveSection("dashboard");
            setIsSidebarOpen(false);
            setOpen(false);
          }}
        >
          Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        title="Admin bildirişləri"
        aria-label="Admin bildirişləri"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-5 h-5" />
        {showCountBadge && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center border-2 border-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        {showDot && (
          <span
            className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border border-background"
            aria-hidden
          />
        )}
      </Button>

      {mounted &&
        open &&
        typeof document !== "undefined" &&
        createPortal(panelContent, document.body)}
    </div>
  );
}
