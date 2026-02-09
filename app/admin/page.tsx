"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Flag,
  ShieldCheck,
  BarChart3,
  Settings,
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  TrendingUp,
  TrendingDown,
  Heart,
  UserCheck,
  AlertTriangle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Filter,
  Download,
  Bell,
  Shield,
  Crown,
  Image as ImageIcon,
  Mail,
  Calendar,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Menu,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/badge";

// Admin sidebar items
const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "İstifadəçilər", icon: Users },
  { id: "reports", label: "Şikayətlər", icon: Flag },
  { id: "verification", label: "Təsdiq Növbəsi", icon: ShieldCheck },
  { id: "messages", label: "Mesajlar", icon: MessageSquare },
  { id: "analytics", label: "Analitika", icon: BarChart3 },
  { id: "settings", label: "Tənzimləmələr", icon: Settings },
];

// Mock data for admin
const mockStats = {
  totalUsers: 12847,
  activeUsers: 8392,
  newUsersToday: 127,
  totalMessages: 284729,
  messagesPerDay: 8420,
  totalMatches: 42891,
  matchRate: 34.2,
  pendingVerifications: 23,
  pendingReports: 8,
  premiumUsers: 1284,
};

const mockReports = [
  { id: "r1", reporterId: "user1", reportedId: "user2", reason: "Uyğunsuz şəkillər", status: "pending", date: "2026-01-20" },
  { id: "r2", reporterId: "user3", reportedId: "user4", reason: "Spam mesajlar", status: "pending", date: "2026-01-20" },
  { id: "r3", reporterId: "user5", reportedId: "user6", reason: "Saxta profil", status: "reviewed", date: "2026-01-19" },
  { id: "r4", reporterId: "user7", reportedId: "user8", reason: "Təhqiredici davranış", status: "pending", date: "2026-01-20" },
];

const mockVerificationQueue = [
  { id: "v1", userId: "selcan", userName: "Selcan", photo: "/avatars/selcan.png", submittedAt: "2026-01-20 14:30", status: "pending" },
  { id: "v2", userId: "nigar", userName: "Nigar", photo: "/avatars/nigar.png", submittedAt: "2026-01-20 12:15", status: "pending" },
  { id: "v3", userId: "leyla", userName: "Leyla", photo: "/avatars/leyla.png", submittedAt: "2026-01-19 18:45", status: "pending" },
];

export default function AdminPage() {

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

  // Convex Queries
  const stats = useQuery(api.admin.getPlatformStats, { adminEmail: user?.email || "" });
  const allUsers = useQuery(api.admin.getAllUsers, { adminEmail: user?.email || "" });
  const waitlistUsers = useQuery(api.admin.getWaitlistUsers, { adminEmail: user?.email || "" });
  const recentActivity = useQuery(api.admin.getRecentActivity, { adminEmail: user?.email || "" });

  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
  };

  // Filter users based on search
  const userList = allUsers || [];
  const filteredUsers = userList.filter((u: any) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

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
              {!isCollapsed && item.id === "reports" && mockStats.pendingReports > 0 && (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Ümumi İstifadəçilər"
                    value={displayStats.totalUsers.toLocaleString('en-US')}
                    change={+12.5}
                    icon={Users}
                    color="blue"
                  />
                  <StatCard
                    title="Aktiv İstifadəçilər"
                    value={displayStats.activeUsers.toLocaleString('en-US')}
                    change={+8.3}
                    icon={UserCheck}
                    color="green"
                  />
                  <StatCard
                    title="Bugünkü Mesajlar"
                    value={displayStats.todayMessages?.toLocaleString('en-US') || "0"} 
                    change={0}
                    icon={MessageSquare}
                    color="purple"
                  />
                  <StatCard
                    title="Uyğunluq Sayı"
                    value={displayStats.totalMatches?.toString() || "0"}
                    change={+5.7}
                    icon={Heart}
                    color="pink"
                  />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Gözləyən Şikayətlər</h3>
                      <span className="text-2xl font-bold text-red-500">{displayStats.pendingReports || 0}</span>
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
                      <span className="text-2xl font-bold text-orange-500">{displayStats.pendingVerifications || 0}</span>
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
                      <span className="text-2xl font-bold text-yellow-500">{displayStats.bannedUsers || 0}</span>
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
                    {recentActivity && recentActivity.length > 0 ? (
                      recentActivity.slice(0, 6).map((activity: any) => {
                        const getIcon = () => {
                          switch(activity.actionType) {
                            case 'banned': return { icon: Ban, color: 'text-red-500' };
                            case 'verified': return { icon: CheckCircle, color: 'text-green-500' };
                            case 'waitlist': return { icon: Clock, color: 'text-orange-500' };
                            default: return { icon: Users, color: 'text-blue-500' };
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="İstifadəçi axtar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtr
                  </Button>
                  <Button variant="outline" className="gap-2">
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
                                  {user.role === 'admin' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                                  {user.role === 'superadmin' && <Crown className="w-4 h-4 text-yellow-500" />}
                                </p>
                                <p className="text-xs text-muted-foreground">{user.email || user.clerkId || "No email"}</p>
                              </div>
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
                                <Eye className="w-4 h-4" />
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Reports */}
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
                    {mockReports.filter(r => r.status === "pending").length} gözləyən şikayət
                  </p>
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Yenilə
                  </Button>
                </div>

                <div className="space-y-4">
                  {mockReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-card border border-border rounded-2xl p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            report.status === "pending" ? "bg-red-500/10" : "bg-green-500/10"
                          }`}>
                            <AlertTriangle className={`w-5 h-5 ${
                              report.status === "pending" ? "text-red-500" : "text-green-500"
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold">{report.reason}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Şikayət edən: {report.reporterId} → {report.reportedId}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {report.date}
                            </p>
                          </div>
                        </div>

                        {report.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-green-500 hover:text-green-600"
                              onClick={() => simulateAction(() => {})}
                              disabled={isLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Həll Et
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-500 hover:text-red-600"
                              onClick={() => simulateAction(() => {})}
                              disabled={isLoading}
                            >
                              <Ban className="w-4 h-4" />
                              Blokla
                            </Button>
                          </div>
                        )}

                        {report.status === "reviewed" && (
                          <span className="text-xs text-green-500 font-medium">Həll edilib</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
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
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chart Placeholder */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">İstifadəçi Artımı</h3>
                    <div className="h-64 flex items-center justify-center bg-muted/30 rounded-xl">
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Qrafik göstərişi</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Uyğunluq Statistikası</h3>
                    <div className="h-64 flex items-center justify-center bg-muted/30 rounded-xl">
                      <div className="text-center text-muted-foreground">
                        <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Qrafik göstərişi</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-4">Əsas Göstəricilər</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Orta Sessiya Müddəti", value: "12 dəq" },
                      { label: "Günlük Aktiv İstifadəçi", value: "8,392" },
                      { label: "Çevrilmə Nisbəti", value: "4.2%" },
                      { label: "Saxlama Nisbəti", value: "67%" },
                    ].map((metric, i) => (
                      <div key={i} className="text-center p-4 bg-muted/30 rounded-xl">
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                      </div>
                    ))}
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
                <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                  {[
                    { title: "Qeydiyyat Tənzimləmələri", description: "Yeni istifadəçi qeydiyyatı üçün qaydalar" },
                    { title: "Məzmun Filterləri", description: "Avtomatik məzmun moderasiyası" },
                    { title: "Bildiriş Tənzimləmələri", description: "E-poçt və push bildirişləri" },
                    { title: "Premium Planlar", description: "Abunəlik qiymətləri və xüsusiyyətlər" },
                    { title: "API Açarları", description: "Xarici xidmət inteqrasiyaları" },
                  ].map((setting, i) => (
                    <button
                      key={i}
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
                    <Button variant="outline" size="sm">Son 7 Gün</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl text-center">
                      <p className="text-3xl font-bold">{displayStats.totalMessages.toLocaleString('en-US')}</p>
                      <p className="text-sm text-muted-foreground mt-1">Ümumi Mesajlar</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl text-center">
                      <p className="text-3xl font-bold">{Math.round((displayStats.totalMessages || 0) / 30).toLocaleString('en-US')}</p>
                      <p className="text-sm text-muted-foreground mt-1">Günlük Ortalama</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl text-center">
                      <p className="text-3xl font-bold">2.3</p>
                      <p className="text-sm text-muted-foreground mt-1">Orta Cavab Müddəti (saat)</p>
                    </div>
                  </div>
                </div>
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
                      {/* {selectedUser.age && `, ${selectedUser.age}`} */} 
                      {/* Age might not be directly available in user list depending on schema sync */}
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
                        <Eye className="w-4 h-4 mr-2" />
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
