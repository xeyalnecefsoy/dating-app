"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MODERATION_PRESET_REASONS_AZ } from "@/lib/moderationTemplates";
import { formatAzDateTime, reportReasonLabelAz } from "@/lib/formatAz";
import { ArrowLeft, Check, Clock, PencilLine, RefreshCw, ShieldAlert, UserCheck, UserX, X } from "lucide-react";

type TabType = "waitlist" | "reports";
const FOUNDER_EMAIL = "xeyalnecefsoy@gmail.com";

export default function AdminMobilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isLoading } = useUser();
  const { isLoading: isConvexAuthLoading, isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const normalizedRole = (user?.role || "").toLowerCase();
  const normalizedUserEmail = (user?.email || "").toLowerCase();

  const isAdmin =
    !!user &&
    (normalizedRole === "admin" ||
      normalizedRole === "moderator" ||
      normalizedRole === "superadmin" ||
      normalizedUserEmail === FOUNDER_EMAIL);

  const [activeTab, setActiveTab] = useState<TabType>("waitlist");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [moderationSheet, setModerationSheet] = useState<{
    u: Record<string, unknown>;
    mode: "reject" | "revision";
  } | null>(null);
  const [moderationDraft, setModerationDraft] = useState("");

  React.useEffect(() => {
    if (!isLoading && !isAdmin) router.replace("/");
  }, [isLoading, isAdmin, router]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "reports" || tab === "waitlist") {
      setActiveTab(tab);
    }
  }, []);

  const canLoadAdminData = isAdmin && !isConvexAuthLoading && isConvexAuthenticated;
  const snapshot = useQuery(api.ops.getMobileAdminSnapshot, canLoadAdminData ? {} : "skip");
  const approveWaitlist = useMutation(api.ops.quickApproveWaitlist);
  const rejectWaitlist = useMutation(api.ops.quickRejectWaitlist);
  const requestRevision = useMutation(api.ops.quickRequestRevision);
  const resolveReport = useMutation(api.ops.quickResolveReport);
  const dismissReport = useMutation(api.ops.quickDismissReport);
  const runAutomationNow = useMutation(api.ops.runAutomationNow);

  const summary = snapshot?.summary;
  const waitlist = snapshot?.queue?.waitlist || [];
  const pendingReports = snapshot?.queue?.pendingReports || [];

  const relative = (ts?: number) => {
    if (!ts) return "-";
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d} gün əvvəl`;
    if (h > 0) return `${h} saat əvvəl`;
    if (m > 0) return `${m} dəq əvvəl`;
    return "indi";
  };

  const onAction = async (key: string, fn: () => Promise<any>, okTitle: string) => {
    setBusyKey(key);
    try {
      await fn();
      showToast({ type: "success", title: okTitle });
    } catch (error: any) {
      showToast({ type: "error", title: "Əməliyyat alınmadı", message: error?.message || "Xəta baş verdi" });
    } finally {
      setBusyKey(null);
    }
  };

  const queueCount = useMemo(
    () => (summary ? summary.waitlistCount + summary.pendingReports : 0),
    [summary]
  );

  if (isLoading || isConvexAuthLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-xl mx-auto h-14 px-4 flex items-center justify-between gap-2">
          <Link href="/admin">
            <Button size="icon" variant="ghost" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center">
            <p className="text-sm font-semibold">Mobil Admin</p>
            <p className="text-[11px] text-muted-foreground">Tez qərar paneli</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => onAction("sweep", () => runAutomationNow({}), "Avtomatik yoxlama icra olundu")}
            disabled={busyKey === "sweep"}
          >
            <RefreshCw className={`w-5 h-5 ${busyKey === "sweep" ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Action Queue</p>
            <p className="text-2xl font-bold mt-1">{queueCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Gözləyən iş</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Aktiv İstifadəçi</p>
            <p className="text-2xl font-bold mt-1">{summary?.activeUsers ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Toplam: {summary?.totalUsers ?? 0}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Gözləyən Şikayət</p>
            <p className="text-2xl font-bold mt-1 text-red-500">{summary?.pendingReports ?? 0}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Waitlist</p>
            <p className="text-2xl font-bold mt-1 text-amber-500">{summary?.waitlistCount ?? 0}</p>
          </div>
        </section>

        {snapshot?.activeSystemAlert && (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{snapshot.activeSystemAlert.titleAz}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {snapshot.activeSystemAlert.blocksAccess ? "Maintenance mode aktivdir" : "Sistem bildirişi aktivdir"}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border bg-card p-2 grid grid-cols-2 gap-2">
          <Button variant={activeTab === "waitlist" ? "default" : "ghost"} onClick={() => setActiveTab("waitlist")} className="rounded-xl">
            Waitlist ({summary?.waitlistCount ?? 0})
          </Button>
          <Button variant={activeTab === "reports" ? "default" : "ghost"} onClick={() => setActiveTab("reports")} className="rounded-xl">
            Reports ({summary?.pendingReports ?? 0})
          </Button>
        </section>

        {activeTab === "waitlist" ? (
          <section className="space-y-3">
            {waitlist.length === 0 ? (
              <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
                Waitlist boşdur.
              </div>
            ) : (
              waitlist.map((u: any) => (
                <article key={u._id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {u.gender || "-"} • {u.age || "-"} • {u.location || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{relative(u.createdAt)}</p>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
                    Şəkil/bio üçün əvvəl <span className="text-foreground font-medium">Düzəliş</span>; rədd
                    yalnız ciddi pozuntu üçündür.
                  </p>
                  <div className="flex flex-col gap-2 mt-3">
                    <Button
                      className="gap-1 w-full"
                      disabled={!!busyKey}
                      onClick={() =>
                        onAction(
                          `approve-${u._id}`,
                          () => approveWaitlist({ targetUserId: u._id }),
                          "İstifadəçi təsdiqləndi"
                        )
                      }
                    >
                      <UserCheck className="w-4 h-4" /> Təsdiqlə
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        className="gap-1"
                        disabled={!!busyKey}
                        onClick={() => {
                          setModerationDraft(MODERATION_PRESET_REASONS_AZ[0] ?? "");
                          setModerationSheet({ u, mode: "revision" });
                        }}
                      >
                        <PencilLine className="w-4 h-4" /> Düzəliş
                      </Button>
                      <Button
                        variant="destructive"
                        className="gap-1"
                        disabled={!!busyKey}
                        onClick={() => {
                          setModerationDraft(MODERATION_PRESET_REASONS_AZ[0] ?? "");
                          setModerationSheet({ u, mode: "reject" });
                        }}
                      >
                        <UserX className="w-4 h-4" /> Rədd
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        ) : (
          <section className="space-y-3">
            {pendingReports.length === 0 ? (
              <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
                Gözləyən şikayət yoxdur.
              </div>
            ) : (
              pendingReports.map((r: any) => (
                <article key={r._id} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{reportReasonLabelAz(String(r.reason))}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {r.reporterName} → {r.reportedName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                        {formatAzDateTime(r.createdAt)}
                      </p>
                      {r.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                      )}
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button
                      className="gap-1"
                      disabled={!!busyKey}
                      onClick={() =>
                        onAction(
                          `resolve-${r._id}`,
                          () => resolveReport({ reportId: r._id }),
                          "Şikayət həll olundu"
                        )
                      }
                    >
                      <Check className="w-4 h-4" /> Həll Et
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1"
                      disabled={!!busyKey}
                      onClick={() =>
                        onAction(
                          `dismiss-${r._id}`,
                          () => dismissReport({ reportId: r._id }),
                          "Şikayət dismiss edildi"
                        )
                      }
                    >
                      <X className="w-4 h-4" /> Rədd Et
                    </Button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </main>

      {moderationSheet && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/50">
          <div className="bg-card border-t border-border rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">
                {moderationSheet.mode === "revision" ? "Düzəliş tələb et" : "Rədd et — səbəb"}
              </p>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setModerationSheet(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {moderationSheet.mode === "revision"
                ? "İstifadəçi onboardingə gedir; düzəldəndən sonra yenidən növbəyə düşür."
                : "Rədd profili bloklayır. Şəkil/bio üçün Düzəliş daha uyğundur."}
            </p>
            <p className="text-xs font-medium text-foreground mb-2">Hazır səbəblər</p>
            <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto mb-3">
              {MODERATION_PRESET_REASONS_AZ.map((r) => {
                const selected = moderationDraft === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setModerationDraft(r)}
                    className={`text-left rounded-xl border px-3 py-2 text-xs leading-snug ${
                      selected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                        : "border-border bg-background"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            <Textarea
              value={moderationDraft}
              onChange={(e) => setModerationDraft(e.target.value)}
              rows={4}
              className="resize-none mb-3"
              placeholder="Mesaj (bildiriş)..."
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setModerationSheet(null)}>
                Ləğv
              </Button>
              <Button
                className="flex-1"
                variant={moderationSheet.mode === "reject" ? "destructive" : "default"}
                disabled={!moderationDraft.trim() || !!busyKey}
                onClick={() => {
                  const text = moderationDraft.trim();
                  if (!text) return;
                  const key =
                    moderationSheet.mode === "reject"
                      ? `reject-${moderationSheet.u._id}`
                      : `revision-${moderationSheet.u._id}`;
                  onAction(
                    key,
                    () =>
                      moderationSheet.mode === "reject"
                        ? rejectWaitlist({
                            targetUserId: moderationSheet.u._id as any,
                            reason: text,
                          })
                        : requestRevision({
                            targetUserId: moderationSheet.u._id as any,
                            reason: text,
                          }),
                    moderationSheet.mode === "reject" ? "Rədd edildi" : "Düzəliş tələb olundu"
                  ).then(() => setModerationSheet(null));
                }}
              >
                {moderationSheet.mode === "reject" ? "Rədd et" : "Düzəliş tələb et"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
