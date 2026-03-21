"use client";

import React, { useState, useEffect, useRef, useMemo, type JSX } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Search,
  Heart,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Check,
  X as XIcon,
  Mail,
  Clock,
  Trash2,
  Pencil,
  Camera,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";

import { BottomNav } from "@/components/Navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getChannelId, cn } from "@/lib/utils";
import { ConversationRow } from "@/components/messages/ConversationRow";
// GiftModal removed
import { StoriesBar } from "@/components/stories";
import { PARTNER_VENUES } from "@/lib/partner-venues";
import { ICEBREAKERS, GLOBAL_ICEBREAKERS } from "@/lib/icebreakers";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { ReportModal } from "@/components/ReportModal";

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
};

type Conversation = {
  id: string;
  participantId: string;
  messages: ChatMessage[];
};

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isOnboarded,
    markMatchAsRead,
    acceptMessageRequest,
    declineMessageRequest,
    cancelMessageRequest,
    markMessageRequestsAsSeen,
  } = useUser();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);
  const editMessageMutation = useMutation(api.messages.editMessage);
  const markGeneralSeenMutation = useMutation(api.messages.markGeneralSeen);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // const [showGiftModal, setShowGiftModal] = useState(false); // Removed

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showIcebreakerModal, setShowIcebreakerModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [expandedTimestamps, setExpandedTimestamps] = useState<string[]>([]);

  // Mentions State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCursorIndex, setMentionCursorIndex] = useState<number | null>(
    null,
  );

  const mentionResults = useQuery(
    api.users.searchUsersForMention,
    mentionQuery !== null
      ? { query: mentionQuery, currentUserId: user?.id || "" }
      : "skip",
  );

  const markReadMutation = useMutation(api.messages.markRead);
  const hideConversationMutation = useMutation(api.matches.hideConversation);

  // Text translations
  const txt = {
    messages: language === "az" ? "Mesajlar" : "Messages",
    searchMessages: language === "az" ? "Mesajları axtar" : "Search messages",
    newMatches: language === "az" ? "Yeni Uyğunluqlar" : "New Matches",
    noMatchesYet: language === "az" ? "Hələ uyğunluq yoxdur" : "No matches yet",
    startSwiping:
      language === "az"
        ? "Uyğunluq tapmaq üçün kartları sürüşdürməyə başlayın!"
        : "Start swiping to find your match!",
    startDiscovering:
      language === "az" ? "Kəşf Etməyə Başla" : "Start Discovering",
    youMatched: language === "az" ? "Uyğunluq tapdınız!" : "You matched!",
    activeNow: language === "az" ? "İndi aktivdir" : "Active now",
    messagePlaceholder: language === "az" ? "Mesaj..." : "Message...",
    you: language === "az" ? "Siz: " : "You: ",
    messageRequests: language === "az" ? "Mesaj İstəkləri" : "Message Requests",
    sentRequests: language === "az" ? "Göndərilmiş İstəklər" : "Sent Requests",
    pending: language === "az" ? "Gözləyir" : "Pending",
    accept: language === "az" ? "Qəbul Et" : "Accept",
    decline: language === "az" ? "Rədd Et" : "Decline",
    wantsToChat:
      language === "az"
        ? "sizinlə söhbət etmək istəyir"
        : "wants to chat with you",
    now: language === "az" ? "İndi" : "Now",
    yourTurn: language === "az" ? "Sizin növbəniz" : "Your turn",
    publicChat: language === "az" ? "Söhbətgah" : "Public Chat",
    publicChatDesc:
      language === "az" ? "Hər kəs üçün açıq söhbət" : "Open chat for everyone",
    matchMessage:
      language === "az" ? "Söhbətə başlayın!" : "Start the conversation!",
    loading: language === "az" ? "Yüklənir..." : "Loading...",
    incomingRequests:
      language === "az" ? "Gələn İstəklər" : "Incoming Requests",
    noRequests:
      language === "az" ? "Gələn istəyiniz yoxdur" : "No incoming requests",
    noSentRequests:
      language === "az" ? "Göndərilmiş istəyiniz yoxdur" : "No sent requests",
    requestAccepted:
      language === "az" ? "İstək qəbul edildi!" : "Request accepted!",
    requestDeclined:
      language === "az" ? "İstək rədd edildi" : "Request declined",
    clearConversation:
      language === "az" ? "Söhbəti məndən sil" : "Clear from my chats",
    clearConversationConfirm:
      language === "az"
        ? "Bu söhbət yalnız sizdən silinəcək. Davam edək?"
        : "This will remove the chat only for you. Continue?",
    conversationCleared:
      language === "az"
        ? "Söhbət sizdən silindi"
        : "Conversation removed from your chats",
  };

  useEffect(() => {
    if (!isOnboarded) {
      router.push("/onboarding");
      return;
    }

    // Initialize conversations from matches
    // We don't need to manually create conversation objects from matches anymore,
    // as we will fetch them from the DB or use the user's match list to display the list.
    // However, for the UI state `conversations` works as a local cache/optimistic UI.
    // Let's keep it but populate it correctly if needed, or rely on Convex `messages.list`.
  }, [isOnboarded, user, router, language]);

  // Handle deep link to specific user
  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    if (userIdParam) {
      if (userIdParam === "general") {
        if (!selectedConv || selectedConv.id !== "general") {
          // Fetch general chat history from Convex directly, don't rely on local state
          setSelectedConv(generalChatConv);
        }
      } else {
        // If we have a userId param, we want to open a chat with this user.
        if (!selectedConv || selectedConv.participantId !== userIdParam) {
          setSelectedConv({
            id: `conv-${userIdParam}`,
            participantId: userIdParam,
            messages: [],
          });
        }
      }
    } else {
      // If URL has no userId, clear selectedConv (handle browser back button)
      if (selectedConv) setSelectedConv(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  // const matchedUsers = ... (Removed MOCK_USERS)
  // We need to fetch details for the match list if we display a sidebar, but TopNav/BottomNav handles navigation.
  // This page seems to be a full-screen chat or list.
  // Wait, the UI has a back button, so it's likely a chat view *or* a list view?
  // Actually, `activeChannelId` and `convexMessages` usage suggests it renders a specific chat.
  // But line 38 shows `conversations` state.
  // The logic seems to be: if `selectedConv` is set, show Chat. Else show... wait, where is the list?
  // The `return` block only renders the Chat View if `selectedConv` is true!
  // If `selectedConv` is null, what does it render?
  // Looking at the file content... it seems to ONLY render the chat view (line 306).
  // If `selectedConv` is null, it renders NOTHING? (line 1100? No, wait).

  // Ah, `app/messages/page.tsx` seems to be designed to be handling BOTH list and chat?
  // Or maybe it's just the Layout?
  // Let's check `app/messages/layout.tsx` if it exists.
  // If `MessagesPage` returns `null` or empty div when no conversation is selected, that's bad.
  // But wait, the previous code had `if (selectedConv) { ... return ... }`
  // What if `!selectedConv`?
  // I need to check the bottom of the file to see the `else` block or fallthrough.
  // The read output (line 800) ended inside the `deleteConfirmId` modal.
  // I must check what happens if `!selectedConv`.

  // Update: I will just remove MOCK_USERS usage here.

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConv) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || "current-user",
      text: newMessage,
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConv.id
          ? { ...conv, messages: [...conv.messages, message] }
          : conv,
      ),
    );

    setSelectedConv((prev) =>
      prev ? { ...prev, messages: [...prev.messages, message] } : null,
    );
    setNewMessage("");

    // Auto reply
    setTimeout(
      () => {
        const repliesEn = [
          "That's interesting! Tell me more 😊",
          "I totally agree!",
          "Haha! 😄",
          "That's so cool!",
          "Would love to chat more!",
        ];
        const repliesAz = [
          "Bu maraqlıdır! Daha çox danış 😊",
          "Tamamilə razıyam!",
          "Haha! 😄",
          "Bu çox gözəldir!",
          "Daha çox söhbət etmək istərdim!",
        ];
        const replies = language === "az" ? repliesAz : repliesEn;
        const reply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: selectedConv.participantId,
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date(),
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConv.id
              ? { ...conv, messages: [...conv.messages, reply] }
              : conv,
          ),
        );

        setSelectedConv((prev) =>
          prev ? { ...prev, messages: [...prev.messages, reply] } : null,
        );
      },
      1000 + Math.random() * 1000,
    );
  };

  // Determine active channel ID
  // For private chats, we must generate a consistent ID regardless of who is viewing it.
  const activeChannelId =
    selectedConv?.id === "general"
      ? "general"
      : user && selectedConv
        ? getChannelId(user.id, selectedConv.participantId)
        : null;

  // Convex Integration
  // Only query if we have an active channel
  const convexMessages = useQuery(
    api.messages.list,
    activeChannelId ? { channelId: activeChannelId } : "skip",
  );

  const markCurrentConversationRead = React.useCallback(() => {
    if (!selectedConv || !user) return;
    if (!activeChannelId || selectedConv.id === "general") return;
    if (document.visibilityState !== "visible") return;

    markReadMutation({
      channelId: activeChannelId,
      userId: user.id,
    }).catch(console.error);
  }, [activeChannelId, markReadMutation, selectedConv, user]);

  // Mark private conversation as read when open
  useEffect(() => {
    if (!selectedConv || !user) return;

    if (
      selectedConv.participantId &&
      user.unreadMatches?.includes(selectedConv.participantId)
    ) {
      markMatchAsRead(selectedConv.participantId);
    }

    if (!activeChannelId || selectedConv.id === "general") {
      return;
    }

    markCurrentConversationRead();
  }, [
    activeChannelId,
    convexMessages,
    markCurrentConversationRead,
    markMatchAsRead,
    selectedConv,
    user,
  ]);

  useEffect(() => {
    if (!activeChannelId || !selectedConv || selectedConv.id === "general")
      return;

    const onFocus = () => markCurrentConversationRead();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markCurrentConversationRead();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [activeChannelId, markCurrentConversationRead, selectedConv]);

  // Presence
  const friendPresence = useQuery(
    api.presence.getStatus,
    selectedConv && selectedConv.participantId && selectedConv.id !== "general"
      ? { userId: selectedConv.participantId }
      : "skip",
  );

  // Fetch participant details for selected conversation if not in mocks
  const isSelectedGeneral = selectedConv?.id === "general";

  // Fetch user if we have a participantId (and it's not general)
  const dbUser = useQuery(
    api.users.getUser,
    selectedConv && !isSelectedGeneral
      ? { clerkId: selectedConv.participantId }
      : "skip",
  );

  // For general chat, prefetch profiles of all senders so we can show names instead of raw IDs
  const generalSenderIds = useMemo(() => {
    if (!convexMessages || !selectedConv || selectedConv.id !== "general")
      return [] as string[];
    const unique = new Set<string>();
    for (const msg of convexMessages as any[]) {
      if (msg.userId) unique.add(String(msg.userId));
    }
    return Array.from(unique);
  }, [convexMessages, selectedConv]);

  const generalSenderProfiles = useQuery(
    api.users.getUsersByIds,
    selectedConv && selectedConv.id === "general" && generalSenderIds.length > 0
      ? { ids: generalSenderIds }
      : "skip",
  );

  const visibleMatchIds = useQuery(
    api.matches.list,
    user ? { userId: user.id } : "skip",
  );

  // Fetch profiles for all relevant users (visible matches, incoming requests, sent requests)
  const allIdsToFetch = Array.from(
    new Set([
      ...(visibleMatchIds || []).map((id) => String(id)),
      ...(user?.messageRequests || []),
      ...(user?.sentMessageRequests || []),
    ]),
  );

  const matchProfiles = useQuery(api.users.getUsersByIds, {
    ids: allIdsToFetch,
  });

  // Last message in general chat (for unread indicator)
  const generalLastMessage = useQuery(
    api.messages.last,
    user ? { channelId: "general" } : "skip",
  );

  const sendMessageMutation = useMutation(api.messages.send);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();

      // 2. Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();

      // 3. Send message with storageId
      await sendMessageMutation({
        body: storageId,
        userId: user?.id || "Anonymous",
        channelId: activeChannelId!,
        format: "image",
      });

      showToast({
        title: language === "az" ? "Uğurlu" : "Success",
        message: language === "az" ? "Şəkil göndərildi" : "Image sent",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: language === "az" ? "Xəta" : "Error",
        message:
          language === "az"
            ? "Şəkil yüklənə bilmədi"
            : "Failed to upload image",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convexMessages]);

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteMessageMutation({
        id: msgId as any,
        userId: user?.id || "Anonymous",
      });
      showToast({
        title: language === "az" ? "Silindi" : "Deleted",
        type: "info",
        duration: 2000,
      });
    } catch (e: any) {
      console.error(e);
      showToast({
        title: language === "az" ? "Xəta" : "Error",
        message: e.message.includes("too old")
          ? language === "az"
            ? "15 dəqiqədən gec silmək olmur"
            : "Too late to delete (15m limit)"
          : language === "az"
            ? "Silmək mümkün olmadı"
            : "Failed to delete",
        type: "error",
      });
    }
  };

  const handleEditMessage = async (msgId: string, newText: string) => {
    try {
      await editMessageMutation({
        id: msgId as any,
        userId: user?.id || "Anonymous",
        newBody: newText,
      });
      setEditingMessageId(null);
      showToast({
        title: language === "az" ? "Yeniləndi" : "Updated",
        message:
          language === "az"
            ? "Mesaj uğurla dəyişdirildi"
            : "Message updated successfully",
        type: "success",
      });
    } catch (e: any) {
      showToast({
        title: language === "az" ? "Xəta" : "Error",
        message: e.message.includes("too old")
          ? language === "az"
            ? "15 dəqiqə keçib"
            : "Too late to edit"
          : language === "az"
            ? "Yeniləmək mümkün olmadı"
            : "Failed to update",
        type: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await handleDeleteMessage(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChannelId) return;

    try {
      await sendMessageMutation({
        body: newMessage,
        userId: user?.id || "Anonymous", // Send ID, not name
        channelId: activeChannelId,
        format: "text",
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleClearConversation = async () => {
    if (!selectedConv || selectedConv.id === "general") return;
    if (!window.confirm(txt.clearConversationConfirm)) return;

    try {
      await hideConversationMutation({
        partnerId: selectedConv.participantId,
        userId: user?.id || "",
      });

      setSelectedConv(null);
      router.push("/messages");
      showToast({
        title: txt.conversationCleared,
        type: "success",
        duration: 2200,
      });
    } catch (error) {
      console.error("Failed to clear conversation:", error);
      showToast({
        title: language === "az" ? "Xəta" : "Error",
        message:
          language === "az"
            ? "Söhbəti silmək mümkün olmadı"
            : "Failed to clear conversation",
        type: "error",
      });
    }
  };

  // Add a "Söhbətgah" option to the conversation list
  const generalChatConv: Conversation = {
    id: "general",
    participantId: "community",
    messages: [],
  };

  // Logic for participant:
  const participant = React.useMemo(() => {
    if (isSelectedGeneral) return null;
    if (dbUser) {
      return {
        id: dbUser.clerkId || dbUser._id,
        name: dbUser.name,
        avatar: dbUser.avatar || dbUser.image || "/placeholder-avatar.svg",
        age: dbUser.age || 25,
        location: dbUser.location || "Unknown",
      };
    }
    // Fallback for immediate render if needed, or null
    return selectedConv
      ? {
          id: selectedConv.participantId,
          name: "User",
          avatar: "/placeholder-avatar.svg",
        }
      : null;
  }, [dbUser, isSelectedGeneral, selectedConv]);

  // When user opens Söhbətgah, mark it as seen for unread indicator (must be top-level hook)
  useEffect(() => {
    if (!user) return;
    if (selectedConv?.id !== "general") return;
    markGeneralSeenMutation().catch(() => {});
  }, [selectedConv?.id, user, markGeneralSeenMutation]);

  // Chat View
  if (selectedConv) {
    const isGeneral = selectedConv.id === "general";

    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col md:static md:z-auto md:h-screen">
        {/* Main Content Container with padding for BottomNav */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header */}
          <header className="flex-none z-40 glass border-b border-border/50">
            <div className="px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => router.push("/messages")} // Go back to list
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    {isGeneral ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="relative w-10 h-10 shadow-sm bg-muted rounded-full overflow-hidden">
                        <Image
                          src={participant?.avatar || "/placeholder-avatar.svg"}
                          alt={participant?.name || "Participant"}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background shadow-sm",
                        isGeneral || friendPresence?.isOnline
                          ? "bg-[#20D5A0]"
                          : "bg-muted-foreground/40",
                      )}
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm sm:text-base">
                      {isGeneral ? "Söhbətgah" : participant?.name}
                    </h2>
                    <p
                      className={cn(
                        "text-[10px] sm:text-xs",
                        isGeneral || friendPresence?.isOnline
                          ? "text-[#20D5A0]"
                          : "text-muted-foreground",
                      )}
                    >
                      {isGeneral
                        ? txt.activeNow
                        : friendPresence?.isOnline
                          ? txt.activeNow
                          : friendPresence?.lastSeen
                            ? `${language === "az" ? "Son görülmə: " : "Last seen: "}${new Date(friendPresence.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {!isGeneral && participant && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                    onClick={handleClearConversation}
                    title={txt.clearConversation}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    onClick={() => setShowReportModal(true)}
                    title={
                      language === "az"
                        ? "İstifadəçini Şikayət Et"
                        : "Report User"
                    }
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Messages */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {/* Loading State */}
            {convexMessages === undefined && (
              <div className="text-center text-muted-foreground py-10">
                {txt.loading}
              </div>
            )}

            {/* Match Banner (Only for private chats) */}
            {!isGeneral && convexMessages?.length === 0 && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm text-primary font-medium">
                    {txt.youMatched}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {txt.matchMessage}
                </p>
              </div>
            )}

            {(() => {
              // Unified message handling
              const remoteMessages =
                convexMessages?.map((msg: any) => ({
                  id: msg._id,
                  senderId: msg.userId,
                  text: msg.body,
                  timestamp: new Date(msg._creationTime),
                  format: msg.format,
                  venueId: msg.venueId,
                  icebreakerId: msg.icebreakerId,
                  imageUrl: msg.imageUrl,
                  isRead: msg.isRead,
                  isDeleted: msg.isDeleted,
                  editedAt: msg.editedAt,
                })) || [];

              // If we have remote messages, prefer them. If not, and it's a new private match, show the local intro message.
              // However, general chat (Aura Community) should purely rely on remote or stay empty.
              const isPrivateChat = selectedConv.id !== "general";
              const showLocalFallback =
                remoteMessages.length === 0 && isPrivateChat;

              // Ensure we display updated messages
              const displayMessages =
                remoteMessages.length > 0
                  ? remoteMessages
                  : showLocalFallback
                    ? selectedConv.messages
                    : [];

              if (displayMessages.length === 0 && !isGeneral) {
                // If absolutely no messages (not even local), show match banner (handled below if we return null here? No, let's keep array empty)
              }

              // Helper: map senderId to human-friendly name for General chat
              const resolveGeneralSenderName = (senderId: string) => {
                if (!senderId) return "İstifadəçi";
                if (senderId === user?.id) return user?.name || "Siz";
                const profile = (generalSenderProfiles as any[])?.find(
                  (u) => u.clerkId === senderId || u._id === senderId,
                );
                return profile?.name || senderId;
              };

              // Helper: map senderId to avatar URL for General chat
              const resolveGeneralSenderAvatar = (senderId: string) => {
                if (!senderId) return user?.avatar || "/placeholder-avatar.svg";
                if (senderId === user?.id && user?.avatar) return user.avatar;
                const profile = (generalSenderProfiles as any[])?.find(
                  (u) => u.clerkId === senderId || u._id === senderId,
                );
                return (
                  profile?.avatar ||
                  (profile as any)?.image ||
                  "/placeholder-avatar.svg"
                );
              };

              // Timezone-aware helpers for date grouping (Asia/Baku)
              const toDateKey = (date: Date) =>
                date.toLocaleDateString("en-CA", {
                  timeZone: "Asia/Baku",
                });

              const todayKey = toDateKey(new Date());
              const yesterdayKey = toDateKey(
                new Date(Date.now() - 24 * 60 * 60 * 1000),
              );

              // Ay adları (brauzerdən asılı olmayan, sabit "gün ay il" formatı üçün)
              const MONTH_NAMES_AZ = [
                "yanvar",
                "fevral",
                "mart",
                "aprel",
                "may",
                "iyun",
                "iyul",
                "avqust",
                "sentyabr",
                "oktyabr",
                "noyabr",
                "dekabr",
              ];
              const MONTH_NAMES_EN = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ];

              const formatDateLabel = (date: Date) => {
                const key = toDateKey(date);
                if (key === todayKey)
                  return language === "az" ? "Bugün" : "Today";
                if (key === yesterdayKey)
                  return language === "az" ? "Dünən" : "Yesterday";

                const parts = new Intl.DateTimeFormat("en-CA", {
                  timeZone: "Asia/Baku",
                  day: "2-digit",
                  month: "numeric",
                  year: "numeric",
                }).formatToParts(date);
                const day = parts.find((p) => p.type === "day")?.value ?? "";
                const monthNum = parseInt(
                  parts.find((p) => p.type === "month")?.value ?? "1",
                  10,
                );
                const year = parts.find((p) => p.type === "year")?.value ?? "";
                const monthName =
                  language === "az"
                    ? MONTH_NAMES_AZ[monthNum - 1]
                    : MONTH_NAMES_EN[monthNum - 1];
                return `${day} ${monthName} ${year}`;
              };

              // Precompute which messages should show time by default:
              // last message in each consecutive chain (same sender, same day)
              const messageIdsToShowTime = new Set<string>();
              for (let i = 0; i < displayMessages.length; i++) {
                const current = displayMessages[i];
                const next = displayMessages[i + 1];
                const currentDateKey = toDateKey(new Date(current.timestamp));
                const nextDateKey = next
                  ? toDateKey(new Date(next.timestamp))
                  : null;

                if (
                  !next ||
                  next.senderId !== current.senderId ||
                  nextDateKey !== currentDateKey
                ) {
                  messageIdsToShowTime.add(current.id);
                }
              }

              const rendered: JSX.Element[] = [];
              let lastDateKey: string | null = null;
              let lastSenderIdForDate: string | null = null;

              displayMessages.forEach((msg) => {
                const isMe =
                  msg.senderId === user?.id ||
                  msg.senderId === "current-user" ||
                  msg.senderId === user?.name;
                const isRecent =
                  Date.now() - new Date(msg.timestamp).getTime() <
                  15 * 60 * 1000;
                const canDelete = isGeneral
                  ? isMe && !(msg as any).isDeleted
                  : isMe && isRecent && !(msg as any).isDeleted;
                const canEdit = isGeneral
                  ? isMe && !(msg as any).isDeleted
                  : isMe && isRecent && !(msg as any).isDeleted;

                const isEditing = editingMessageId === msg.id;

                const msgDate = new Date(msg.timestamp);
                const dateKey = toDateKey(msgDate);

                if (dateKey !== lastDateKey) {
                  lastDateKey = dateKey;
                  // New day group: reset sender chain tracking
                  lastSenderIdForDate = null;
                  rendered.push(
                    <div
                      key={`date-${dateKey}`}
                      className="flex justify-center my-2"
                    >
                      <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs bg-card/60 border border-border/60 text-muted-foreground">
                        {formatDateLabel(msgDate)}
                      </span>
                    </div>,
                  );
                }

                // Show avatar only for the first message in a consecutive chain from same sender (per day)
                const showSenderMeta =
                  isGeneral && lastSenderIdForDate !== msg.senderId;

                const isTimestampExpanded = expandedTimestamps.includes(msg.id);
                const showTimestamp =
                  messageIdsToShowTime.has(msg.id) || isTimestampExpanded;

                // Parse story message content
                const storyMatch = msg.text.match(/^\[STORY:([^\]]+)\]\s*(.*)/);
                const storyUrl = storyMatch ? storyMatch[1] : null;
                const cleanText = storyMatch ? storyMatch[2] : msg.text;

                rendered.push(
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} group mb-4`}
                  >
                    <div
                      className={`max-w-[85%] flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar column for general chat (fixed width, clickable on first message in chain) */}
                      {isGeneral && (
                        <div className="w-8 h-8 shrink-0 mt-1">
                          {showSenderMeta && (
                            <Link href={`/user/${msg.senderId}`}>
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
                                <Image
                                  src={resolveGeneralSenderAvatar(msg.senderId)}
                                  alt={resolveGeneralSenderName(msg.senderId)}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Content Column */}
                      <div
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} min-w-0`}
                      >
                        {isEditing ? (
                          <div className="flex flex-col items-end gap-1 min-w-[200px]">
                            {/* Tiny preview while editing */}
                            {storyUrl && (
                              <div className="flex items-center gap-2 mr-1 opacity-60">
                                <div className="relative w-4 h-6 rounded bg-muted overflow-hidden">
                                  <Image
                                    src={storyUrl}
                                    fill
                                    sizes="16px"
                                    className="object-cover"
                                    alt="Story preview"
                                  />
                                </div>
                                <span className="text-[10px] italic">
                                  Story
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2 items-center bg-card border border-primary p-2 rounded-2xl w-full shadow-sm">
                              <Input
                                defaultValue={cleanText}
                                autoFocus
                                onKeyDown={(e: any) => {
                                  if (e.key === "Enter") {
                                    const prefix = storyUrl
                                      ? `[STORY:${storyUrl}] `
                                      : "";
                                    handleEditMessage(
                                      msg.id,
                                      prefix + e.currentTarget.value,
                                    );
                                  } else if (e.key === "Escape") {
                                    setEditingMessageId(null);
                                  }
                                }}
                                className="h-8 text-sm bg-transparent border-none focus-visible:ring-0 px-1"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingMessageId(null)}
                                className="h-6 w-6 p-0 rounded-full hover:bg-secondary shrink-0"
                              >
                                <XIcon className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`px-4 py-2.5 rounded-2xl relative ${
                              isMe
                                ? "bg-primary text-white rounded-br-sm"
                                : "bg-card border border-border rounded-bl-sm"
                            }`}
                            onClick={() =>
                              setExpandedTimestamps((prev) =>
                                prev.includes(msg.id)
                                  ? prev.filter((id) => id !== msg.id)
                                  : [...prev, msg.id],
                              )
                            }
                          >
                            {storyUrl ? (
                              <div className="flex flex-col gap-2 min-w-[120px]">
                                <div className="flex items-center gap-2 border-l-2 border-white/30 pl-2 mb-1 py-1">
                                  <div className="relative w-8 h-12 rounded bg-black/20 overflow-hidden shrink-0">
                                    <Image
                                      src={storyUrl}
                                      alt="Story"
                                      fill
                                      sizes="32px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="text-[10px] opacity-70 uppercase tracking-wider font-medium">
                                    {language === "az"
                                      ? "Hekayəyə cavab"
                                      : "Replied to story"}
                                  </span>
                                </div>
                                <p>{cleanText}</p>
                              </div>
                            ) : (msg as any).format === "invite" &&
                              (msg as any).venueId ? (
                              // Venue Invite Card
                              <div className="w-64">
                                {(() => {
                                  const venue = PARTNER_VENUES.find(
                                    (v) => v.id === (msg as any).venueId,
                                  );
                                  if (!venue) return <p>{msg.text}</p>;
                                  return (
                                    <div className="flex flex-col overflow-hidden">
                                      <div className="relative h-32 -mx-4 -mt-2.5 mb-2 overflow-hidden">
                                        <Image
                                          src={venue.image}
                                          fill
                                          sizes="256px"
                                          className="object-cover"
                                          alt={venue.name}
                                        />
                                        <div className="absolute inset-0 bg-black/20" />
                                        <div className="absolute bottom-2 left-2 bg-white/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                          {venue.name}
                                        </div>
                                      </div>
                                      <p className="font-semibold text-sm mb-1">
                                        {language === "az"
                                          ? "Gəl burada görüşək! 🥂"
                                          : "Let's meet here! 🥂"}
                                      </p>
                                      <p className="text-xs opacity-90 mb-2">
                                        {venue.address}
                                      </p>
                                      <Link href="/venues">
                                        <div className="text-[10px] bg-white/20 hover:bg-white/30 transition-colors py-1.5 text-center rounded cursor-pointer font-medium">
                                          {language === "az"
                                            ? "Məkana bax"
                                            : "View Venue"}
                                        </div>
                                      </Link>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (msg as any).format === "image" ? (
                              <div className="relative">
                                {(msg as any).imageUrl ? (
                                  <div className="relative w-[200px] h-[200px] rounded-lg overflow-hidden border border-white/10">
                                    <Image
                                      src={(msg as any).imageUrl}
                                      alt="Sent image"
                                      fill
                                      sizes="200px"
                                      className="object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-[200px] h-[150px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                  </div>
                                )}
                              </div>
                            ) : (msg as any).format === "icebreaker" ? (
                              // Icebreaker Card
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] opacity-70 uppercase tracking-wider font-bold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Icebreaker
                                </span>
                                <p className="font-medium text-lg leading-snug">
                                  {msg.text}
                                </p>
                              </div>
                            ) : (
                              <p
                                className={
                                  (msg as any).isDeleted
                                    ? "italic opacity-70 text-sm"
                                    : ""
                                }
                              >
                                {msg.text}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-1 px-1 opacity-50 text-muted-foreground">
                          {showTimestamp && (
                            <span className="text-[10px]">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {showTimestamp && (msg as any).editedAt && (
                            <span className="ml-1 text-[10px] italic">
                              {language === "az" ? "Redaktə edilib" : "Edited"}
                            </span>
                          )}
                          {isMe && !isGeneral && (
                            <span className="ml-1">
                              {(msg as any).isRead ? (
                                <div className="flex -space-x-1 text-blue-500">
                                  <Check className="w-3 h-3" />
                                  <Check className="w-3 h-3" />
                                </div>
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu Button */}
                      {(canDelete || canEdit) && !isEditing && (
                        <div className="relative self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === msg.id ? null : msg.id,
                              )
                            }
                            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground transition-all"
                            aria-label={
                              language === "az"
                                ? "Mesaj seçimləri"
                                : "Message options"
                            }
                            title={
                              language === "az"
                                ? "Mesaj seçimləri"
                                : "Message options"
                            }
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown */}
                          {activeMenuId === msg.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute top-0 right-full mr-2 z-50 w-32 bg-popover rounded-xl border border-border shadow-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                <button
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="px-3 py-2.5 text-sm text-left hover:bg-muted flex items-center gap-2 transition-colors relative z-50"
                                >
                                  <Pencil className="w-4 h-4" />{" "}
                                  {language === "az" ? "Düzəliş et" : "Edit"}
                                </button>
                                <div className="h-px bg-border/50" />
                                <button
                                  onClick={() => {
                                    setDeleteConfirmId(msg.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="px-3 py-2.5 text-sm text-left hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors relative z-50"
                                >
                                  <Trash2 className="w-4 h-4" />{" "}
                                  {language === "az" ? "Sil" : "Delete"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>,
                );

                // Update last sender for this date group after rendering
                if (isGeneral) {
                  lastSenderIdForDate = msg.senderId;
                }
              });

              return rendered;
            })()}
            <div ref={messagesEndRef} />
          </main>

          {/* Input - Floating Bar Design */}
          <div className="flex-none glass border border-border/50 mx-4 mb-4 rounded-3xl p-3 z-[70] overflow-visible shadow-lg">
            <div className="flex items-center gap-3 relative">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </Button>
              {/* Gift Button Removed */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0"
                onClick={() => {
                  setShowIcebreakerModal(true);
                  setShowVenueModal(false);
                }}
                title="Icebreaker"
              >
                <Sparkles className="w-5 h-5 text-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0"
                onClick={() => {
                  setShowVenueModal(true);
                  setShowIcebreakerModal(false);
                }}
                title="Invite to Date"
              >
                <Calendar className="w-5 h-5 text-rose-500" />
              </Button>
              <Input
                placeholder={txt.messagePlaceholder}
                value={newMessage}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewMessage(val);

                  // Cursor position
                  const cursor = e.target.selectionStart || val.length;

                  // Find active word
                  // Look backwards from cursor to find a space or start
                  const lastAt = val.lastIndexOf("@", cursor - 1);

                  if (lastAt !== -1) {
                    const textAfterAt = val.substring(lastAt + 1, cursor);
                    // Check if there is a space in the text after @ - if so, we closed the mention
                    if (textAfterAt.includes(" ")) {
                      setMentionQuery(null);
                      setMentionCursorIndex(null);
                    } else {
                      // We are typing a mention
                      setMentionQuery(textAfterAt);
                      setMentionCursorIndex(lastAt + 1); // cursor at @ + 1
                    }
                  } else {
                    setMentionQuery(null);
                    setMentionCursorIndex(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="bg-card border-border rounded-full"
              />

              {/* Mentions Dropdown */}
              {mentionQuery !== null &&
                mentionResults &&
                mentionResults.length > 0 && (
                  <div className="absolute bottom-full mb-3 left-12 w-64 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-2 border-b border-border/50 text-xs font-medium text-muted-foreground bg-muted/30">
                      {language === "az" ? "İstifadəçilər" : "Members"}
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {mentionResults.map((u) => (
                        <button
                          key={u._id}
                          className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left transition-colors"
                          onClick={() => {
                            if (mentionCursorIndex === null) return;
                            const before = newMessage.substring(
                              0,
                              mentionCursorIndex,
                            );
                            const after = newMessage.substring(
                              mentionCursorIndex + mentionQuery.length + 1,
                            ); // +1 because mentionQuery excludes @

                            const newValue = before + u.username + " " + after;
                            setNewMessage(newValue);
                            setMentionQuery(null);
                            setMentionCursorIndex(null);
                            // Focus back
                            // requestAnimationFrame(() => inputRef.current?.focus()); // Need ref for generic input?
                          }}
                        >
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                            <Image
                              src={u.avatar || "/placeholder-avatar.svg"}
                              alt={u.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">
                              {u.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              @{u.username}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="rounded-full gradient-brand border-0 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Gift Modal Removed */}

          {/* Icebreaker Modal */}
          <AnimatePresence>
            {showIcebreakerModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowIcebreakerModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-sm bg-background border border-border rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      Icebreakers
                    </h3>
                    <button
                      onClick={() => setShowIcebreakerModal(false)}
                      className="p-1 rounded-full hover:bg-muted"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {(
                      (activeChannelId === "general"
                        ? GLOBAL_ICEBREAKERS
                        : ICEBREAKERS) || []
                    ).map((ib: any) => (
                      <button
                        key={ib.id}
                        onClick={async () => {
                          const text =
                            language === "az" ? ib.textAz : ib.textEn;
                          await sendMessageMutation({
                            body: text,
                            userId: user?.id || "Anonymous",
                            channelId: activeChannelId!,
                            format: "icebreaker",
                            icebreakerId: ib.id,
                          });
                          setShowIcebreakerModal(false);
                        }}
                        className="w-full text-left p-3 rounded-xl bg-card border border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                            {ib.category === "fun"
                              ? "🎢"
                              : ib.category === "deep"
                                ? "🤔"
                                : "🔥"}
                          </span>
                          <span className="text-sm font-medium">
                            {language === "az" ? ib.textAz : ib.textEn}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Venue Modal */}
          <AnimatePresence>
            {showVenueModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowVenueModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-sm bg-background border border-border rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-rose-500" />
                      {language === "az" ? "Görüşə Dəvət Et" : "Invite to Date"}
                    </h3>
                    <button
                      onClick={() => setShowVenueModal(false)}
                      className="p-1 rounded-full hover:bg-muted"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {PARTNER_VENUES.map((venue: any) => (
                      <button
                        key={venue.id}
                        onClick={async () => {
                          const text =
                            language === "az"
                              ? `Gəl ${venue.name} məkanında görüşək! 🥂`
                              : `Let's meet at ${venue.name}! 🥂`;

                          await sendMessageMutation({
                            body: text,
                            userId: user?.id || "Anonymous",
                            channelId: activeChannelId!,
                            format: "invite",
                            venueId: venue.id,
                          });
                          setShowVenueModal(false);
                        }}
                        className="w-full text-left p-0 rounded-xl bg-card border border-border hover:border-rose-500 transition-all overflow-hidden group relative h-24"
                      >
                        <Image
                          src={venue.image}
                          fill
                          sizes="384px"
                          alt={venue.name}
                          className="absolute inset-0 object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                        <div className="absolute inset-0 p-4 flex flex-col justify-center">
                          <h4 className="text-white font-bold text-lg">
                            {venue.name}
                          </h4>
                          <div className="flex items-center gap-1 text-white/80 text-xs">
                            <MapPin className="w-3 h-3" />
                            {venue.address}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {deleteConfirmId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-sm bg-background border border-border rounded-2xl p-6 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold mb-2">
                    {language === "az"
                      ? "Mesajı silmək istəyirsiniz?"
                      : "Delete message?"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {language === "az"
                      ? "Bu əməliyyat geri qaytarıla bilməz."
                      : "This action cannot be undone."}
                  </p>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      {language === "az" ? "Ləğv et" : "Cancel"}
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                      {language === "az" ? "Sil" : "Delete"}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <BottomNav />
        </div>
      </div>
    );
  }

  // Conversations List
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between relative">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative z-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center pointer-events-none">
            <h1 className="font-bold text-lg">{txt.messages}</h1>
          </div>

          {/* Instagram-style Requests Button */}
          <button
            onClick={() => {
              setShowRequestsModal(true);
              markMessageRequestsAsSeen();
            }}
            className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border hover:bg-muted transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">{txt.incomingRequests}</span>
            {(user?.messageRequests?.length || 0) +
              (user?.sentMessageRequests?.length || 0) >
              0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                {(user?.messageRequests?.length || 0) +
                  (user?.sentMessageRequests?.length || 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={txt.searchMessages}
              className="pl-10 bg-card border-border rounded-full"
            />
          </div>
        </div>

        {/* Stories (from all users for now) */}
        <StoriesBar />

        {/* Conversations */}
        <div className="px-4">
          <h2 className="text-sm text-muted-foreground mb-3">{txt.messages}</h2>

          {/* General Chat Item */}
          {/* General Chat Item */}
          <button
            onClick={() => {
              setSelectedConv(generalChatConv);
              router.push("/messages?userId=general");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-card transition-colors bg-gradient-to-r from-pink-500/5 to-rose-500/5 border border-pink-500/10 mb-2 group"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform duration-300">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground/90">
                  {txt.publicChat}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {user &&
                  generalLastMessage &&
                  generalLastMessage._creationTime >
                    (user.generalLastSeenAt || 0) ? (
                    <>
                      <span className="inline-flex w-2 h-2 rounded-full bg-primary" />
                      {language === "az" ? "Yeni mesajlar" : "New messages"}
                    </>
                  ) : (
                    txt.now
                  )}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate group-hover:text-pink-500 transition-colors">
                {txt.publicChatDesc}
              </p>
            </div>
          </button>

          {/* Matches List */}
          <div className="space-y-1">
            {matchProfiles === undefined ? (
              <p className="text-center text-xs text-muted-foreground py-4">
                {language === "az" ? "Yüklənir..." : "Loading..."}
              </p>
            ) : matchProfiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">{txt.noMatchesYet}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {txt.startSwiping}
                </p>
                <Button
                  asChild
                  className="gradient-brand border-0 rounded-full"
                >
                  <Link href="/discovery">{txt.startDiscovering}</Link>
                </Button>
              </div>
            ) : (
              matchProfiles.map((match) => (
                <ConversationRow
                  key={match.clerkId || match._id}
                  participantId={match.clerkId || match._id}
                  currentUserId={user?.id || "current-user"}
                  isSelected={
                    (selectedConv as Conversation | null)?.participantId ===
                    (match.clerkId || match._id)
                  }
                  onSelect={() => {
                    const fakeConv: Conversation = {
                      id: `conv-${match.clerkId || match._id}`,
                      participantId: match.clerkId || match._id,
                      messages: [], // Empty messages — let Convex fetch real history
                    };
                    setSelectedConv(fakeConv);
                    router.push(
                      `/messages?userId=${match.clerkId || match._id}`,
                    );
                  }}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Navigation */}
      <BottomNav />
      {/* Modals */}
      <AnimatePresence>
        {showRequestsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowRequestsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  {txt.messageRequests}
                </h3>
                <button
                  onClick={() => setShowRequestsModal(false)}
                  className="p-2 rounded-full hover:bg-muted"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Incoming Requests */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    {txt.incomingRequests} ({user?.messageRequests?.length || 0}
                    )
                  </h4>

                  {user?.messageRequests && user.messageRequests.length > 0 ? (
                    <div className="space-y-2">
                      {user.messageRequests.map((reqId) => {
                        // Normally we would fetch the user's details based on reqId.
                        // Here we use a generic placeholder or find it from matchProfiles if possible.
                        const profile = matchProfiles?.find(
                          (p: any) => p.clerkId === reqId || p._id === reqId,
                        );

                        return (
                          <div
                            key={reqId}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border border-dashed"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                                <Image
                                  src={
                                    profile?.avatar || "/placeholder-avatar.svg"
                                  }
                                  alt={profile?.name || "User"}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm truncate">
                                  {profile?.name || "User"}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {txt.wantsToChat}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500"
                                onClick={async () => {
                                  await declineMessageRequest(reqId);
                                  showToast({
                                    title: txt.requestDeclined,
                                    type: "info",
                                    duration: 2000,
                                  });
                                }}
                              >
                                <XIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                className="h-8 w-8 rounded-full gradient-brand border-0"
                                onClick={async () => {
                                  await acceptMessageRequest(reqId);
                                  showToast({
                                    title: txt.requestAccepted,
                                    type: "success",
                                    duration: 2000,
                                  });
                                  // Optionally close and redirect to chat:
                                  setShowRequestsModal(false);
                                  router.push(`/messages?userId=${reqId}`);
                                }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 bg-muted/20 rounded-2xl border border-border border-dashed">
                      <Mail className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        {txt.noRequests}
                      </p>
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    {txt.sentRequests} ({user?.sentMessageRequests?.length || 0}
                    )
                  </h4>

                  {user?.sentMessageRequests &&
                  user.sentMessageRequests.length > 0 ? (
                    <div className="space-y-2">
                      {user.sentMessageRequests.map((reqId) => {
                        const profile = matchProfiles?.find(
                          (p: any) => p.clerkId === reqId || p._id === reqId,
                        );
                        return (
                          <div
                            key={reqId}
                            className="flex items-center justify-between p-3 bg-muted/10 rounded-2xl border border-border border-dashed opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted grayscale shrink-0">
                                <Image
                                  src={
                                    profile?.avatar || "/placeholder-avatar.svg"
                                  }
                                  alt={profile?.name || "User"}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm truncate">
                                  {profile?.name || "User"}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-yellow-500">
                                  {txt.pending}
                                </span>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs text-muted-foreground hover:text-red-500 rounded-full h-7 px-3"
                              onClick={async () => {
                                await cancelMessageRequest(reqId);
                              }}
                            >
                              {txt.decline || "Cancel"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 px-4">
                      <p className="text-xs text-muted-foreground">
                        {txt.noSentRequests}
                      </p>
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

export default function MessagesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <MessagesContent />
    </React.Suspense>
  );
}
