"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  UsersIcon,
  MessageSquare,
  FlagIcon,
  ShieldCheck,
  BarChart3,
  SettingsIcon,
  SearchIcon,
  MoreVertical,
  Ban,
  CheckCircle,
  XCircle,
  XIcon,
  EyeIcon,
  Trash2,
  TrendingUp,
  TrendingDown,
  Heart,
  UserCheck,
  AlertTriangle,
  Clock,
  ArrowLeft,
  RefreshCw,
  FilterIcon,
  Download,
  Bell,
  Shield,
  Crown,
  ImageIcon,
  Mail,
  Calendar,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Menu,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/badge";

const Spinner = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

import { BannersAdmin } from "./BannersAdmin";
import { SystemAlertsAdmin } from "./SystemAlertsAdmin";

// Admin sidebar items
const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "İstifadəçilər", icon: UsersIcon },
  { id: "reports", label: "Şikayətlər", icon: FlagIcon },
  { id: "verification", label: "Təsdiq Növbəsi", icon: ShieldCheck },
  { id: "banners", label: "Qalereya & Slaydlar", icon: ImageIcon },
  { id: "messages", label: "Mesajlar", icon: MessageSquare },
  { id: "system-alerts", label: "Sistem Bildirişləri", icon: AlertTriangle },
  { id: "analytics", label: "Analitika", icon: BarChart3 },
  { id: "settings", label: "Tənzimləmələr", icon: SettingsIcon },
];

// Mock data for admin
// All data now comes from real-time Convex queries — no mock data

export default function AdminPage() {
  const { showToast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  // Redirect if not admin
  React.useEffect(() => {
    if (!isUserLoading && (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
        // Allow access for specific email fallback
        if (user?.email !== 'xeyalnecefsoy@gmail.com') {
             router.replace("/");
        }
    }
  }, [user, isUserLoading, router]);

  // Convex Queries — skip if email not loaded yet to avoid Unauthorized error
  const adminEmail = user?.email || "";
  const stats = useQuery(api.admin.getPlatformStats, adminEmail ? { adminEmail } : "skip");
  const allUsers = useQuery(api.admin.getAllUsers, adminEmail ? { adminEmail } : "skip");
  const waitlistUsers = useQuery(api.admin.getWaitlistUsers, adminEmail ? { adminEmail } : "skip");
  const recentActivity = useQuery(api.admin.getRecentActivity, adminEmail ? { adminEmail } : "skip");
  const platformSettings = useQuery(api.admin.getPlatformSettings, adminEmail ? { adminEmail } : "skip");
  const messageStats = useQuery(api.admin.getMessageStats, adminEmail ? { adminEmail } : "skip");
  const togglePaywall = useMutation(api.admin.togglePaywall);
  const grantPremium = useMutation(api.admin.grantPremium);
  const revokePremium = useMutation(api.admin.revokePremium);
  const verifyUserMut = useMutation(api.admin.verifyUser);

  // Reports
  const reports = useQuery(api.reports.getReports, adminEmail ? { statusFilter: "all" } : "skip");
  const reportStats = useQuery(api.reports.getReportStats, adminEmail ? {} : "skip");
  const updateReportStatusMut = useMutation(api.reports.updateReportStatus);

  const paywallEnabled = platformSettings?.PREMIUM_PAYWALL_ENABLED === "true";

  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilterStatus, setUserFilterStatus] = useState<"all" | "verified" | "premium" | "admin" | "banned">("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch: wait for client mount 
  useEffect(() => { setMounted(true); }, []);

  // Data loading state — true when queries haven't returned yet
  const isDataLoading = stats === undefined || allUsers === undefined;

  // Use real data or fall back to safe defaults
  const displayStats = stats || {
    totalUsers: 0,
    activeUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    waitlistUsers: 0,
    bannedUsers: 0,
    totalMatches: 0,
    totalMessages: 0,
    todayMessages: 0,
    genderRatio: "N/A",
    pendingReports: 0,
    pendingVerifications: 0,
    premiumUsers: 0,
    userGrowth: 0,
    activeGrowth: 0,
    messageGrowth: 0,
    matchGrowth: 0,
  };

  // Filter users based on search and status
  const userList = allUsers || [];
  const filteredUsers = userList.filter((u: any) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchLower)) ||
      (u.email && u.email.toLowerCase().includes(searchLower)) ||
      (u.username && u.username.toLowerCase().includes(searchLower));

    const matchesFilter = 
      userFilterStatus === "all" ? true :
      userFilterStatus === "verified" ? !!u.isVerified :
      userFilterStatus === "premium" ? !!u.isPremium :
      userFilterStatus === "admin" ? (u.role === "admin" || u.role === "superadmin") :
      userFilterStatus === "banned" ? (u.status === "banned" || !!u.isBanned) : true;

    return matchesSearch && matchesFilter;
  });

  const handleExportUsers = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      showToast({ title: "İxrac ediləcək istifadəçi tapılmadı.", type: "error" });
      return;
    }
    
    const headers = ["ID", "Ad/Soyad", "Email", "İstifadəçi Adı", "Rol", "Status", "Qeydiyyat Tarixi", "Təsdiqlidir?", "Premium?"];
    const csvRows = [
      headers.join(","),
      ...filteredUsers.map((u: any) => {
        const row = [
          u._id,
          `"${u.name ? String(u.name).replace(/"/g, '""') : ''}"`,
          `"${u.email || ''}"`,
          u.username || '',
          u.role || 'user',
          u.status === 'banned' || u.isBanned ? 'Banned' : (u.status || 'Active'),
          new Date(u.createdAt).toLocaleDateString('az-AZ'),
          u.isVerified ? 'Təsdiqli' : 'Xeyr',
          u.isPremium ? 'Premium' : 'Xeyr'
        ];
        return row.join(",");
      })
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([`\ufeff${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `danyeri_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const simulateAction = (callback: () => void) => {
    setIsLoading(true);
    setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 800);
  };

  // Mutations
  const banUserMutation = useMutation(api.admin.banUser);
  const setRoleMutation = useMutation(api.admin.setUserRole);
  const approveUserMutation = useMutation(api.admin.approveUser);
  const rejectUserMutation = useMutation(api.admin.rejectUser);

  const handleBanUser = async (userId: string) => {
    if (!confirm("Are you sure you want to ban this user?")) return;
    
    setIsLoading(true);
    try {
        await banUserMutation({ 
            targetUserId: userId as any, 
            adminEmail: user?.email || "",
            reason: "Admin action"
        });
        setSelectedUser(null);
    } catch (e) {
        console.error("Failed to ban:", e);
        alert("Failed to ban user");
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change role to ${newRole}?`)) return;

    setIsLoading(true);
    try {
        await setRoleMutation({
            targetUserId: userId as any,
            adminEmail: user?.email || "",
            newRole
        });
        // Close modal after success
        setSelectedUser(null);
    } catch (e) {
        console.error("Failed to change role:", e);
        alert("Failed to change role. Make sure you are superadmin.");
    } finally {
        setIsLoading(false);
    }
  };

  // Full-page loading: wait for mount + auth + initial data
  // Returns null during SSR to prevent hydration mismatch
  if (!mounted || isUserLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-card border-r border-border
        flex flex-col shrink-0
        transition-all duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        w-64
      `}>
        <div className="p-4 border-b border-border flex items-center justify-between relative overflow-visible">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-lg truncate">Danyeri</h1>
                <p className="text-xs text-muted-foreground truncate">Admin Panel</p>
              </div>
            )}
          </Link>
          <Button 
            variant="outline" 
            size="icon" 
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-border bg-background shadow-md z-[60] p-0 items-center justify-center hover:bg-accent"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto hide-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all overflow-hidden whitespace-nowrap ${
                activeSection === item.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.id === "reports" && (displayStats.pendingReports || 0) > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {displayStats.pendingReports}
                </span>
              )}
              {!isCollapsed && item.id === "verification" && (displayStats.pendingVerifications || 0) > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {displayStats.pendingVerifications}
                </span>
              )}
              {isCollapsed && (item.id === "reports" || item.id === "verification") && (
                 <div className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/">
            <Button variant="outline" className={`w-full gap-2 ${isCollapsed ? "px-0 justify-center" : ""}`} title={isCollapsed ? "Tətbiqə Qayıt" : undefined}>
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {!isCollapsed && "Tətbiqə Qayıt"}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border shrink-0">
          <div className="px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold capitalize truncate">
              {sidebarItems.find(i => i.id === activeSection)?.label}
            </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {displayStats.pendingReports > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || "Admin"} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{user?.name || "Admin"}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                    {user?.role === 'superadmin' || user?.email?.toLowerCase() === 'xeyalnecefsoy@gmail.com' 
                      ? 'Super Admin' 
                      : user?.role === 'admin' ? 'Admin' : 'Moderator'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 pb-20">
          <AnimatePresence mode="wait">
            {/* Banners */}
            {activeSection === "banners" && (
              <BannersAdmin key="banners" />
            )}

            {/* System Alerts */}
            {activeSection === "system-alerts" && (
              <SystemAlertsAdmin key="system-alerts" />
            )}

            {/* Dashboard */}
            {activeSection === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                {isDataLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-12 bg-muted/60 rounded-xl animate-pulse" />
                          <div className="w-14 h-5 bg-muted/60 rounded animate-pulse" />
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="w-20 h-8 bg-muted/60 rounded animate-pulse" />
                          <div className="w-28 h-4 bg-muted/40 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Ümumi İstifadəçilər"
                      value={displayStats.totalUsers.toLocaleString('en-US')}
                      change={displayStats.userGrowth}
                      icon={UsersIcon}
                      color="blue"
                    />
                    <StatCard
                      title="Aktiv İstifadəçilər"
                      value={displayStats.activeUsers.toLocaleString('en-US')}
                      change={displayStats.activeGrowth}
                      icon={UserCheck}
                      color="green"
                    />
                    <StatCard
                      title="Bugünkü Mesajlar"
                      value={displayStats.todayMessages?.toLocaleString('en-US') || "0"} 
                      change={displayStats.messageGrowth}
                      icon={MessageSquare}
                      color="purple"
                    />
                    <StatCard
                      title="Uyğunluq Sayı"
                      value={displayStats.totalMatches?.toLocaleString('en-US') || "0"}
                      change={displayStats.matchGrowth}
                      icon={Heart}
                      color="pink"
                    />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Gözləyən Şikayətlər</h3>
                      {isDataLoading ? (
                        <div className="w-10 h-8 bg-muted/60 rounded animate-pulse" />
                      ) : (
                        <span className="text-2xl font-bold text-red-500">{displayStats.pendingReports || 0}</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveSection("reports")}
                    >
                      Baxış Et
                    </Button>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Təsdiq Növbəsi</h3>
                      {isDataLoading ? (
                        <div className="w-10 h-8 bg-muted/60 rounded animate-pulse" />
                      ) : (
                        <span className="text-2xl font-bold text-orange-500">{displayStats.pendingVerifications || 0}</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveSection("verification")}
                    >
                      Yoxla
                    </Button>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Ban Edilənlər</h3>
                      {isDataLoading ? (
                        <div className="w-10 h-8 bg-muted/60 rounded animate-pulse" />
                      ) : (
                        <span className="text-2xl font-bold text-yellow-500">{displayStats.bannedUsers || 0}</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveSection("users")}
                    >
                      İdarə Et
                    </Button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">Son Fəaliyyətlər</h3>
                  <div className="space-y-3">
                    {isDataLoading || recentActivity === undefined ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3 py-2">
                            <div className="w-9 h-9 rounded-full bg-muted/60 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="w-32 h-3 bg-muted/60 rounded animate-pulse" />
                              <div className="w-20 h-2 bg-muted/40 rounded animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.slice(0, 6).map((activity: any) => {
                        const getIcon = () => {
                          switch(activity.actionType) {
                            case 'banned': return { icon: Ban, color: 'text-red-500' };
                            case 'verified': return { icon: CheckCircle, color: 'text-green-500' };
                            case 'waitlist': return { icon: Clock, color: 'text-orange-500' };
                            default: return { icon: UsersIcon, color: 'text-blue-500' };
                          }
                        };
                        const { icon: Icon, color } = getIcon();
                        return (
                          <div key={activity.id} className="flex items-center gap-3 py-2">
                            <div className={`w-9 h-9 rounded-full bg-muted flex items-center justify-center ${color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{activity.actionText}</p>
                              <p className="text-xs text-muted-foreground">{activity.userName}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Hələlik fəaliyyət yoxdur</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Users */}
            {activeSection === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="İstifadəçi axtar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative shrink-0 w-44">
                    <select
                      value={userFilterStatus}
                      onChange={(e) => setUserFilterStatus(e.target.value as any)}
                      className="w-full h-10 px-3 py-2 pl-9 rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-muted/50 transition-colors appearance-none"
                    >
                      <option value="all">Hamısı</option>
                      <option value="verified">Təsdiqlilər (Mavi Tık)</option>
                      <option value="premium">Premium</option>
                      <option value="admin">Adminlər</option>
                      <option value="banned">Bloklananlar</option>
                    </select>
                    <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  <Button variant="outline" className="gap-2 shrink-0" onClick={handleExportUsers} disabled={filteredUsers.length === 0}>
                    <Download className="w-4 h-4" />
                    İxrac Et
                  </Button>
                </div>

                {/* Users Table */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium">İstifadəçi</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Qoşulma</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Rol</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Əməliyyatlar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((user: any) => (
                        <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Link href={`/user/${user.username || user.clerkId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <img
                                  src={user.avatar || '/placeholder-avatar.svg'}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover bg-muted"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-avatar.svg';
                                  }}
                                />
                                <div>
                                  <p className="font-medium flex items-center gap-2">
                                    {user.name}
                                    {user.isVerified && <span title="Verified" className="flex"><CheckCircle2 className="w-4 h-4 text-blue-500" /></span>}
                                    {user.role === 'admin' && <span title="Admin" className="flex"><ShieldCheck className="w-4 h-4 text-blue-500" /></span>}
                                    {user.role === 'superadmin' && <span title="Superadmin" className="flex"><Crown className="w-4 h-4 text-yellow-500" /></span>}
                                    {user.isPremium && <span title="Premium" className="flex"><Crown className="w-3.5 h-3.5 text-orange-400" /></span>}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {user.username ? `@${user.username}` : user.email || user.clerkId || "No email"}
                                  </p>
                                </div>
                              </Link>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.status === 'banned' ? 'bg-red-500/10 text-red-500' :
                              user.status === 'waitlist' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-green-500/10 text-green-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'banned' ? 'bg-red-500' :
                                user.status === 'waitlist' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`} />
                              {user.status === 'banned' ? 'Bloklu' : user.status === 'waitlist' ? 'Gözləmədə' : 'Aktiv'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('az-AZ') : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="outline">{user.role || "user"}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedUser(user)}
                                title="İstifadəçi məlumatlarını gör"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleBanUser(user._id)}
                                title={user.status === 'banned' ? 'İstifadəçi artıq bloklanıb' : 'İstifadəçini blokla'}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${user.isVerified ? 'text-blue-500 hover:text-blue-600' : 'text-muted-foreground hover:text-blue-500'}`}
                                onClick={async () => {
                                  try {
                                    await verifyUserMut({ 
                                      adminEmail, 
                                      targetUserId: user._id, 
                                      verify: !user.isVerified 
                                    });
                                    showToast({ title: user.isVerified ? 'Təsdiq silindi' : 'Təsdiqləndi', type: 'success' });
                                  } catch (e) {
                                    console.error(e);
                                    showToast({ title: 'Xəta baş verdi', type: 'error' });
                                  }
                                }}
                                title={user.isVerified ? 'Təsdiqi (Verified) Ləğv Et' : 'Profilə Verified (Mavi tık) ver'}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${user.isPremium ? 'text-orange-500 hover:text-orange-600' : 'text-muted-foreground hover:text-orange-500'}`}
                                onClick={async () => {
                                  try {
                                    if (user.isPremium) {
                                      await revokePremium({ adminEmail, targetUserId: user._id });
                                    } else {
                                      await grantPremium({ adminEmail, targetUserId: user._id, plan: 'monthly' });
                                    }
                                  } catch (e) { console.error(e); }
                                }}
                                title={user.isPremium ? 'Premium-u ləğv et' : 'Premium ver'}
                              >
                                <Crown className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeSection === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {reportStats?.pending || 0} gözləyən şikayət
                  </p>
                </div>

                {(!reports || reports.length === 0) ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Heç bir şikayət yoxdur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report: any) => (
                      <div
                        key={report._id}
                        className="bg-card border border-border rounded-2xl p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              report.status === "pending" ? "bg-red-500/10" : 
                              report.status === "resolved" ? "bg-green-500/10" : "bg-muted"
                            }`}>
                              <AlertTriangle className={`w-5 h-5 ${
                                report.status === "pending" ? "text-red-500" : 
                                report.status === "resolved" ? "text-green-500" : "text-muted-foreground"
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-semibold capitalize">{report.reason}</h4>
                              {report.description && (
                                <p className="text-sm text-muted-foreground mt-0.5">{report.description}</p>
                              )}
                              <p className="text-sm text-muted-foreground mt-1">
                                {report.reporterName} → {report.reportedName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(report.createdAt).toLocaleDateString('az-AZ')}
                              </p>
                            </div>
                          </div>

                          {report.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-green-500 hover:text-green-600"
                                onClick={() => {
                                  updateReportStatusMut({ reportId: report._id, status: "resolved" })
                                    .then(() => showToast({ type: "success", title: "Şikayət həll edildi" }))
                                    .catch(() => showToast({ type: "error", title: "Xəta baş verdi" }));
                                }}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Həll Et
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-yellow-500 hover:text-yellow-600"
                                onClick={() => {
                                  updateReportStatusMut({ reportId: report._id, status: "dismissed" })
                                    .then(() => showToast({ type: "success", title: "Şikayət rədd edildi" }))
                                    .catch(() => showToast({ type: "error", title: "Xəta baş verdi" }));
                                }}
                              >
                                <XIcon className="w-4 h-4" />
                                Rədd Et
                              </Button>
                            </div>
                          )}

                          {report.status === "resolved" && (
                            <span className="text-xs text-green-500 font-medium">Həll edilib</span>
                          )}
                          {report.status === "dismissed" && (
                            <span className="text-xs text-yellow-500 font-medium">Rədd edilib</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Verification Queue */}
            {activeSection === "verification" && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {waitlistUsers?.length || 0} gözləyən təsdiq
                  </p>
                </div>

                {(!waitlistUsers || waitlistUsers.length === 0) && (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                    <p className="text-muted-foreground">Gözləyən istifadəçi yoxdur</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {waitlistUsers?.map((item: any) => (
                    <div
                      key={item._id}
                      className="bg-card border border-border rounded-2xl overflow-hidden"
                    >
                      <div className="aspect-square bg-muted relative">
                        <img
                          src={item.avatar || '/placeholder-avatar.svg'}
                          alt={item.userName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-full bg-orange-500 text-white text-xs font-medium">
                            Gözləyir
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <Link href={`/user/${item.username || item.clerkId}`} className="hover:underline">
                          <h4 className="font-semibold">{item.name}</h4>
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {item.username ? `@${item.username}` : item.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.location} • {item.age} yaş
                        </p>
                        {item.bio && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.bio}</p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          <Button
                            size="sm"
                            className="flex-1 gap-1 bg-green-500 hover:bg-green-600"
                            onClick={async () => {
                              setIsLoading(true);
                              try {
                                await approveUserMutation({ 
                                  targetUserId: item._id, 
                                  adminEmail: user?.email || "" 
                                });
                              } catch (e) {
                                console.error("Approve failed:", e);
                                alert("Təsdiq uğursuz oldu");
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? <Spinner className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Təsdiqlə
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 text-red-500 hover:text-red-600"
                            onClick={async () => {
                              setIsLoading(true);
                              try {
                                await rejectUserMutation({ 
                                  targetUserId: item._id, 
                                  adminEmail: user?.email || "",
                                  reason: "Admin rədd etdi"
                                });
                              } catch (e) {
                                console.error("Reject failed:", e);
                                alert("Rədd uğursuz oldu");
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            disabled={isLoading}
                          >
                            <XCircle className="w-4 h-4" />
                            Rədd Et
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Analytics */}
            {activeSection === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Message Activity Chart */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">Son 7 Gün Mesaj Fəaliyyəti</h3>
                  {messageStats ? (
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                      {messageStats.dailyBreakdown.map((day, i) => {
                        const maxCount = Math.max(...messageStats.dailyBreakdown.map(d => d.count), 1);
                        const heightPct = (day.count / maxCount) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-medium text-muted-foreground">{day.count}</span>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-pink-500 transition-all duration-500" 
                              style={{ height: `${Math.max(heightPct, 4)}%` }} />
                            <span className="text-[10px] text-muted-foreground">{day.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <Spinner className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Distribution */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">İstifadəçi Paylanması</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Kişi</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${displayStats.totalUsers ? (displayStats.maleUsers / displayStats.totalUsers) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{displayStats.maleUsers}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Qadın</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 rounded-full" style={{ width: `${displayStats.totalUsers ? (displayStats.femaleUsers / displayStats.totalUsers) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{displayStats.femaleUsers}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Premium</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${displayStats.totalUsers ? (displayStats.premiumUsers / displayStats.totalUsers) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{displayStats.premiumUsers}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Gözləmədə</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${displayStats.totalUsers ? (displayStats.waitlistUsers / displayStats.totalUsers) * 100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{displayStats.waitlistUsers}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Stats */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Uyğunluq Statistikası</h3>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-muted/30 rounded-xl">
                        <p className="text-3xl font-bold">{displayStats.totalMatches.toLocaleString('en-US')}</p>
                        <p className="text-sm text-muted-foreground mt-1">Ümumi Uyğunluqlar</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-xl">
                        <p className="text-3xl font-bold">{displayStats.genderRatio}</p>
                        <p className="text-sm text-muted-foreground mt-1">Cins Nisbəti (K/Q)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Əsas Göstəricilər — real data */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">Əsas Göstəricilər</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-2xl font-bold">{displayStats.totalMessages.toLocaleString('en-US')}</p>
                      <p className="text-xs text-muted-foreground mt-1">Ümumi Mesajlar</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-2xl font-bold">{displayStats.activeUsers.toLocaleString('en-US')}</p>
                      <p className="text-xs text-muted-foreground mt-1">Aktiv İstifadəçilər</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-2xl font-bold">{displayStats.premiumUsers.toLocaleString('en-US')}</p>
                      <p className="text-xs text-muted-foreground mt-1">Premium İstifadəçilər</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <p className="text-2xl font-bold">{displayStats.bannedUsers.toLocaleString('en-US')}</p>
                      <p className="text-xs text-muted-foreground mt-1">Ban Edilənlər</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings */}
            {activeSection === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Premium Paywall Toggle */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Premium Paywall
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {paywallEnabled
                          ? 'Paywall AKTİV — ödəniş tələb olunur'
                          : 'Paywall SÖNDÜRÜLÜB — premium hamıya pulsuzdur'}
                      </p>
                    </div>
                    <Button
                      variant={paywallEnabled ? "destructive" : "default"}
                      size="sm"
                      onClick={async () => {
                        try {
                          await togglePaywall({ adminEmail, enabled: !paywallEnabled });
                        } catch (e) { console.error(e); }
                      }}
                    >
                      {paywallEnabled ? 'Söndür' : 'Aktivləşdir'}
                    </Button>
                  </div>
                  <div className={`mt-4 p-3 rounded-xl text-sm ${paywallEnabled ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                    {paywallEnabled
                      ? '⚠️ İstifadəçilər premium aktivləşdirmək üçün ödəniş etməlidirlər (Epoint inteqrasiyası lazımdır)'
                      : '✅ Bütün istifadəçilər premium-u pulsuz aktivləşdirə bilərlər'}
                  </div>
                </div>

                {/* Other Settings */}
                <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                  {[
                    { title: "Qeydiyyat Tənzimləmələri", description: "Yeni istifadəçi qeydiyyatı üçün qaydalar" },
                    { title: "Məzmun Filterləri", description: "Avtomatik məzmun moderasiyası" },
                    { title: "Bildiriş Tənzimləmələri", description: "E-poçt və push bildirişləri" },
                    { title: "API Açarları", description: "Xarici xidmət inteqrasiyaları" },
                  ].map((setting, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        showToast({
                          type: "info",
                          title: "Tezliklə",
                          message: "Bu bölmə hələ hazırlanır.",
                        });
                      }}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div>
                        <h4 className="font-medium">{setting.title}</h4>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            {activeSection === "messages" && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Mesaj Statistikası</h3>
                    <span className="text-xs text-muted-foreground">Real-time</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl text-center">
                      <p className="text-3xl font-bold">{(messageStats?.totalMessages ?? displayStats.totalMessages).toLocaleString('en-US')}</p>
                      <p className="text-sm text-muted-foreground mt-1">Ümumi Mesajlar</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl text-center">
                      <p className="text-3xl font-bold">{(messageStats?.dailyAverage ?? 0).toLocaleString('en-US')}</p>
                      <p className="text-sm text-muted-foreground mt-1">Günlük Ortalama (Son 7 Gün)</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl text-center">
                      <p className="text-3xl font-bold">{messageStats?.avgResponseTimeHours ?? 0}</p>
                      <p className="text-sm text-muted-foreground mt-1">Orta Cavab Müddəti (saat)</p>
                    </div>
                  </div>
                </div>

                {/* Daily Breakdown Chart */}
                {messageStats?.dailyBreakdown && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Son 7 Gün Mesaj Fəaliyyəti</h3>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                      {messageStats.dailyBreakdown.map((day, i) => {
                        const maxCount = Math.max(...messageStats.dailyBreakdown.map(d => d.count), 1);
                        const heightPct = (day.count / maxCount) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-medium text-muted-foreground">{day.count}</span>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-pink-500 transition-all duration-500" 
                              style={{ height: `${Math.max(heightPct, 4)}%` }} />
                            <span className="text-[10px] text-muted-foreground">{day.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-background border border-border rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-32 bg-gradient-to-br from-pink-500 to-purple-600">
                <img
                  src={selectedUser.avatar || selectedUser.image || '/placeholder-avatar.svg'}
                  alt={selectedUser.name}
                  className="absolute -bottom-12 left-6 w-24 h-24 rounded-2xl border-4 border-background object-cover"
                />
              </div>

              <div className="pt-14 pb-6 px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {selectedUser.name}
                      <Badge variant="outline" className="ml-2">{selectedUser.role || "User"}</Badge>
                    </h3>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="w-4 h-4" />
                      {selectedUser.email || "No email"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button className="flex-1" variant="outline" onClick={() => window.open(`/users/${selectedUser._id}`, '_blank')}>
                        <EyeIcon className="w-4 h-4 mr-2" />
                        Profili Gör
                    </Button>
                    <Button 
                        className="flex-1" 
                        variant="destructive"
                        onClick={() => handleBanUser(selectedUser._id)}
                    >
                        <Ban className="w-4 h-4 mr-2" />
                        Blokla
                    </Button>
                  </div>
                  
                  {/* Superadmin Actions */}
                  {user?.role === 'superadmin' && (user as any).email === 'xeyalnecefsoy@gmail.com' && (
                      <div className="flex gap-2 justify-center pt-2">
                          <Button size="sm" variant="ghost" onClick={() => handleChangeRole(selectedUser._id, 'user')}>User</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleChangeRole(selectedUser._id, 'moderator')}>Mod</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleChangeRole(selectedUser._id, 'admin')}>Admin</Button>
                      </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "pink";
}) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 text-blue-500",
    green: "from-green-500/20 to-green-600/20 text-green-500",
    purple: "from-purple-500/20 to-purple-600/20 text-purple-500",
    pink: "from-pink-500/20 to-pink-600/20 text-pink-500",
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}
