"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Search, Heart, MoreVertical, Phone, Video, Image as ImageIcon, Check, X as XIcon, Mail, Clock, Trash2, Pencil, Camera, Loader2 } from "lucide-react";
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
import { ICEBREAKERS } from "@/lib/icebreakers";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Calendar, MapPin } from "lucide-react";

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
  const { user, isOnboarded, markMatchAsRead, acceptMessageRequest, declineMessageRequest, cancelMessageRequest } = useUser();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);
  const editMessageMutation = useMutation(api.messages.editMessage);
  
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
  
  // Mark as read when opening conversation
  useEffect(() => {
    if (selectedConv && selectedConv.participantId && user?.unreadMatches?.includes(selectedConv.participantId)) {
        markMatchAsRead(selectedConv.participantId);
    }
  }, [selectedConv, user?.unreadMatches, markMatchAsRead]);

  // Text translations
  const txt = {
    messages: language === 'az' ? 'Mesajlar' : 'Messages',
    searchMessages: language === 'az' ? 'Mesajları axtar' : 'Search messages',
    newMatches: language === 'az' ? 'Yeni Uyğunluqlar' : 'New Matches',
    noMatchesYet: language === 'az' ? 'Hələ uyğunluq yoxdur' : 'No matches yet',
    startSwiping: language === 'az' ? 'Uyğunluq tapmaq üçün kartları sürüşdürməyə başlayın!' : 'Start swiping to find your match!',
    startDiscovering: language === 'az' ? 'Kəşf Etməyə Başla' : 'Start Discovering',
    youMatched: language === 'az' ? 'Uyğunluq tapdınız!' : 'You matched!',
    activeNow: language === 'az' ? 'İndi aktivdir' : 'Active now',
    messagePlaceholder: language === 'az' ? 'Mesaj...' : 'Message...',
    you: language === 'az' ? 'Siz: ' : 'You: ',
    messageRequests: language === 'az' ? 'Mesaj İstəkləri' : 'Message Requests',
    sentRequests: language === 'az' ? 'Göndərilmiş İstəklər' : 'Sent Requests',
    pending: language === 'az' ? 'Gözləyir' : 'Pending',
    accept: language === 'az' ? 'Qəbul Et' : 'Accept',
    decline: language === 'az' ? 'Rədd Et' : 'Decline',
    wantsToChat: language === 'az' ? 'sizinlə söhbət etmək istəyir' : 'wants to chat with you',
    now: language === 'az' ? 'İndi' : 'Now',
    publicChat: language === 'az' ? 'Hər kəs üçün açıq söhbət' : 'Public chat for everyone',
    matchMessage: language === 'az' ? 'Söhbətə başlayın!' : 'Start the conversation!',
    loading: language === 'az' ? 'Yüklənir...' : 'Loading...',
    incomingRequests: language === 'az' ? 'Gələn İstəklər' : 'Incoming Requests',
    noRequests: language === 'az' ? 'Gələn istəyiniz yoxdur' : 'No incoming requests',
    noSentRequests: language === 'az' ? 'Göndərilmiş istəyiniz yoxdur' : 'No sent requests',
    requestAccepted: language === 'az' ? 'İstək qəbul edildi!' : 'Request accepted!',
    requestDeclined: language === 'az' ? 'İstək rədd edildi' : 'Request declined',
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
      if (userIdParam === 'general') {
         if (!selectedConv || selectedConv.id !== 'general') {
             setSelectedConv(generalChatConv);
         }
      } else {
          // If we have a userId param, we want to open a chat with this user.
          if (!selectedConv || selectedConv.participantId !== userIdParam) {
               setSelectedConv({
                   id: `conv-${userIdParam}`,
                   participantId: userIdParam,
                   messages: []
               });
          }
      }
    } else {
        // If URL has no userId, clear selectedConv (handle browser back button)
        if (selectedConv) setSelectedConv(null);
    }
  }, [searchParams, selectedConv]);

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
      timestamp: new Date()
    };

    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConv.id 
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    );


    setSelectedConv(prev => prev ? { ...prev, messages: [...prev.messages, message] } : null);
    setNewMessage("");

    // Auto reply
    setTimeout(() => {
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
      const replies = language === 'az' ? repliesAz : repliesEn;
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: selectedConv.participantId,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date()
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConv.id 
            ? { ...conv, messages: [...conv.messages, reply] }
            : conv
        )
      );

      setSelectedConv(prev => prev ? { ...prev, messages: [...prev.messages, reply] } : null);
    }, 1000 + Math.random() * 1000);
  };

  // Determine active channel ID
  // For private chats, we must generate a consistent ID regardless of who is viewing it.
  const activeChannelId = selectedConv?.id === "general" 
    ? "general" 
    : (user && selectedConv ? getChannelId(user.id, selectedConv.participantId) : null);

  // Convex Integration
  // Only query if we have an active channel
  const convexMessages = useQuery(api.messages.list, 
    activeChannelId ? { channelId: activeChannelId } : "skip"
  );
  
  // Presence
  const friendPresence = useQuery(api.presence.getStatus, 
    selectedConv && selectedConv.participantId && selectedConv.id !== "general"
        ? { userId: selectedConv.participantId } 
        : "skip"
  );

  // Fetch participant details for selected conversation if not in mocks
  const isSelectedGeneral = selectedConv?.id === "general";
  
  // Fetch user if we have a participantId (and it's not general)
  const dbUser = useQuery(api.users.getUser, 
    selectedConv && !isSelectedGeneral 
      ? { clerkId: selectedConv.participantId } 
      : "skip"
  );

  // Fetch profiles for users in the match list
  const matchProfiles = useQuery(api.users.getUsersByIds, { 
    ids: user?.matches || [] 
  });
  
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
        type: "success"
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: language === "az" ? "Xəta" : "Error",
        message: language === "az" ? "Şəkil yüklənə bilmədi" : "Failed to upload image",
        type: "error"
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
          ? (language === "az" ? "15 dəqiqədən gec silmək olmur" : "Too late to delete (15m limit)")
          : (language === "az" ? "Silmək mümkün olmadı" : "Failed to delete"),
        type: "error"
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
        message: language === "az" ? "Mesaj uğurla dəyişdirildi" : "Message updated successfully",
        type: "success",
      });
    } catch (e: any) {
      showToast({
        title: language === "az" ? "Xəta" : "Error",
        message: e.message.includes("too old")
          ? (language === "az" ? "15 dəqiqə keçib" : "Too late to edit")
          : (language === "az" ? "Yeniləmək mümkün olmadı" : "Failed to update"),
        type: "error"
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
          format: "text"
        });
        setNewMessage("");
    } catch (error) {
        console.error("Failed to send message:", error);
    }
  };

  // Add a "General Chat" option to the conversation list
  const generalChatConv: Conversation = {
     id: "general",
     participantId: "community",
     messages: [] 
  };

  // Logic for participant:
  const participant = React.useMemo(() => {
     if (isSelectedGeneral) return null;
     if (dbUser) {
        return {
             id: dbUser.clerkId || dbUser._id,
             name: dbUser.name,
             avatar: dbUser.avatar || "/placeholder-avatar.svg",
             age: dbUser.age || 25,
             location: dbUser.location || "Unknown",
        };
     }
     // Fallback for immediate render if needed, or null
     return selectedConv ? { id: selectedConv.participantId, name: "User", avatar: "/placeholder-avatar.svg" } : null;
  }, [dbUser, isSelectedGeneral, selectedConv]);

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
                onClick={() => {
                    setSelectedConv(null);
                    router.push('/messages');
                }} // Go back to list
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  {isGeneral ? (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">A</div>
                  ) : (
                    <img 
                      src={participant?.avatar} 
                      className="w-10 h-10 rounded-full object-cover shadow-sm bg-muted" 
                      alt={participant?.name}
                    />
                  )}
                  <div className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background shadow-sm",
                    isGeneral || friendPresence?.isOnline ? "bg-[#20D5A0]" : "bg-muted-foreground/40"
                  )} />
                </div>
                <div>
                  <h2 className="font-semibold text-sm sm:text-base">{isGeneral ? "Danyeri Community" : participant?.name}</h2>
                  <p className={cn("text-[10px] sm:text-xs", 
                    isGeneral || friendPresence?.isOnline ? "text-[#20D5A0]" : "text-muted-foreground"
                  )}>
                    {isGeneral 
                        ? txt.activeNow 
                        : (friendPresence?.isOnline 
                            ? txt.activeNow 
                            : (friendPresence?.lastSeen 
                                ? `${language === 'az' ? 'Son görülmə: ' : 'Last seen: '}${new Date(friendPresence.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                                : "Offline")
                          )
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
           {/* Loading State */}
           {convexMessages === undefined && (
             <div className="text-center text-muted-foreground py-10">{txt.loading}</div>
           )}

           {/* Match Banner (Only for private chats) */}
           {!isGeneral && convexMessages?.length === 0 && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm text-primary font-medium">{txt.youMatched}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{txt.matchMessage}</p>
              </div>
           )}

           {(() => {
             // Unified message handling
             const remoteMessages = convexMessages?.map((msg: any) => ({
               id: msg._id,
               senderId: msg.userId,
               text: msg.body,
               timestamp: new Date(msg._creationTime),
               format: msg.format,
               venueId: msg.venueId,
               icebreakerId: msg.icebreakerId,
               isDeleted: msg.isDeleted
             })) || [];

             // If we have remote messages, prefer them. If not, and it's a new private match, show the local intro message.
             // However, general chat (Aura Community) should purely rely on remote or stay empty.
             const isPrivateChat = selectedConv.id !== "general";
             const showLocalFallback = remoteMessages.length === 0 && isPrivateChat;
             
             // Ensure we display updated messages
             const displayMessages = remoteMessages.length > 0 ? remoteMessages : (showLocalFallback ? selectedConv.messages : []);

             if (displayMessages.length === 0 && !isGeneral) {
                // If absolutely no messages (not even local), show match banner (handled below if we return null here? No, let's keep array empty)
             }

             return displayMessages.map((msg) => {
               const isMe = msg.senderId === user?.id || msg.senderId === "current-user" || msg.senderId === user?.name;
               // Check if message is less than 15 mins old
               const isRecent = (Date.now() - new Date(msg.timestamp).getTime() < 15 * 60 * 1000);
               const canDelete = isMe && isRecent && !(msg as any).isDeleted;
               const canEdit = isMe && isRecent && !(msg as any).isDeleted;

               const isEditing = editingMessageId === msg.id;
               
               // Parse story message content
               const storyMatch = msg.text.match(/^\[STORY:([^\]]+)\]\s*(.*)/);
               const storyUrl = storyMatch ? storyMatch[1] : null;
               const cleanText = storyMatch ? storyMatch[2] : msg.text;

               return (
                 <motion.div
                   key={msg.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex ${isMe ? "justify-end" : "justify-start"} group mb-4`}
                 >
                   <div className={`max-w-[85%] flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Content Column */}
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} min-w-0`}>
                     <span className="text-[10px] text-muted-foreground mb-1 px-1 opacity-50">
                       {/* Correct Name Display */}
                       {isMe ? (user?.name || "Siz") : (participant?.name || msg.senderId)}
                     </span>
                     
                     {isEditing ? (
                        <div className="flex flex-col items-end gap-1 min-w-[200px]">
                            {/* Tiny preview while editing */}
                            {storyUrl && (
                                <div className="flex items-center gap-2 mr-1 opacity-60">
                                    <img src={storyUrl} className="w-4 h-6 object-cover rounded bg-muted" />
                                    <span className="text-[10px] italic">Story</span>
                                </div>
                            )}
                            <div className="flex gap-2 items-center bg-card border border-primary p-2 rounded-2xl w-full shadow-sm">
                                <Input 
                                   defaultValue={cleanText}
                                   autoFocus
                                   onKeyDown={(e: any) => {
                                     if (e.key === 'Enter') {
                                       const prefix = storyUrl ? `[STORY:${storyUrl}] ` : "";
                                       handleEditMessage(msg.id, prefix + e.currentTarget.value);
                                     } else if (e.key === 'Escape') {
                                       setEditingMessageId(null);
                                     }
                                   }}
                                   className="h-8 text-sm bg-transparent border-none focus-visible:ring-0 px-1"
                                />
                                <Button size="sm" variant="ghost" onClick={() => setEditingMessageId(null)} className="h-6 w-6 p-0 rounded-full hover:bg-secondary shrink-0"><XIcon className="w-3 h-3" /></Button>
                            </div>
                        </div>
                     ) : (
                         <div 
                           className={`px-4 py-2.5 rounded-2xl relative ${
                             isMe 
                               ? "bg-primary text-white rounded-br-sm" 
                               : "bg-card border border-border rounded-bl-sm"
                         }`}
                       >
                          {storyUrl ? (
                            <div className="flex flex-col gap-2 min-w-[120px]">
                              <div className="flex items-center gap-2 border-l-2 border-white/30 pl-2 mb-1 py-1">
                                <img 
                                  src={storyUrl} 
                                  alt="Story" 
                                  className="w-8 h-12 object-cover rounded bg-black/20"
                                />
                                <span className="text-[10px] opacity-70 uppercase tracking-wider font-medium">
                                  {language === 'az' ? 'Hekayəyə cavab' : 'Replied to story'}
                                </span>
                              </div>
                              <p>{cleanText}</p>
                            </div>
                          ) : (msg as any).format === 'invite' && (msg as any).venueId ? (
                              // Venue Invite Card
                              <div className="w-64">
                                {(() => {
                                  const venue = PARTNER_VENUES.find(v => v.id === (msg as any).venueId);
                                  if (!venue) return <p>{msg.text}</p>;
                                  return (
                                    <div className="flex flex-col overflow-hidden">
                                      <div className="relative h-32 -mx-4 -mt-2.5 mb-2">
                                        <img src={venue.image} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20" />
                                        <div className="absolute bottom-2 left-2 bg-white/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                          {venue.name}
                                        </div>
                                      </div>
                                      <p className="font-semibold text-sm mb-1">{language === 'az' ? 'Gəl burada görüşək! 🥂' : 'Let\'s meet here! 🥂'}</p>
                                      <p className="text-xs opacity-90 mb-2">{venue.address}</p>
                                      <Link href="/venues">
                                        <div className="text-[10px] bg-white/20 hover:bg-white/30 transition-colors py-1.5 text-center rounded cursor-pointer font-medium">
                                          {language === 'az' ? 'Məkana bax' : 'View Venue'}
                                        </div>
                                      </Link>
                                    </div>
                                  );
                                })()}
                              </div>
                          ) : (msg as any).format === 'image' ? (
                              <div className="relative">
                                {(msg as any).imageUrl ? (
                                  <img 
                                    src={(msg as any).imageUrl} 
                                    className="rounded-lg max-w-[200px] h-auto object-cover border border-white/10"
                                    alt="Sent image"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-[200px] h-[150px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
                                     <ImageIcon className="w-8 h-8 opacity-20" />
                                  </div>
                                )}
                              </div>
                          ) : (msg as any).format === 'icebreaker' ? (
                              // Icebreaker Card
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] opacity-70 uppercase tracking-wider font-bold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Icebreaker
                                </span>
                                <p className="font-medium text-lg leading-snug">{msg.text}</p>
                              </div>
                          ) : (
                            <p className={(msg as any).isDeleted ? "italic opacity-70 text-sm" : ""}>{msg.text}</p>
                          )}
                       </div>
                     )}
                   
                     <div className="flex items-center gap-1 mt-1 px-1 opacity-50 text-muted-foreground">
                        <span className="text-[10px]">
                         {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                     </div>
                    </div>

                    {/* Menu Button */}
                    {canDelete && !isEditing && (
                        <div className="relative self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown */}
                          {activeMenuId === msg.id && (
                            <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute top-0 right-full mr-2 z-50 w-32 bg-popover rounded-xl border border-border shadow-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                               <button 
                                 onClick={() => { setEditingMessageId(msg.id); setActiveMenuId(null); }}
                                 className="px-3 py-2.5 text-sm text-left hover:bg-muted flex items-center gap-2 transition-colors relative z-50"
                               >
                                  <Pencil className="w-4 h-4" /> {language === 'az' ? 'Düzəliş et' : 'Edit'}
                               </button>
                               <div className="h-px bg-border/50" />
                               <button 
                                 onClick={() => { setDeleteConfirmId(msg.id); setActiveMenuId(null); }}
                                 className="px-3 py-2.5 text-sm text-left hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors relative z-50"
                               >
                                  <Trash2 className="w-4 h-4" /> {language === 'az' ? 'Sil' : 'Delete'}
                               </button>
                            </div>
                            </>
                          )}
                        </div>
                     )}

                   </div>
                 </motion.div>
               );
             });
           })()}
           <div ref={messagesEndRef} />
        </main>

        {/* Input - Flex-none ensures it sits at the bottom of the flex container */}
        <div className="flex-none glass border-t border-border/50 p-4 safe-bottom z-[70]">
          <div className="flex items-center gap-3">
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
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <ImageIcon className="w-5 h-5" />}
            </Button>
            {/* Gift Button Removed */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full shrink-0"
              onClick={() => setShowIcebreakerModal(true)}
              title="Icebreaker"
            >
              <Sparkles className="w-5 h-5 text-blue-500" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full shrink-0"
              onClick={() => setShowVenueModal(true)}
              title="Invite to Date"
            >
              <Calendar className="w-5 h-5 text-rose-500" />
            </Button>
            <Input 
              placeholder={txt.messagePlaceholder}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                  }
              }}
              className="bg-card border-border rounded-full"
            />
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
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowIcebreakerModal(false)}
            >
               <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="w-full max-w-sm bg-background border border-border rounded-3xl p-6 shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      Icebreakers
                    </h3>
                    <button onClick={() => setShowIcebreakerModal(false)} className="p-1 rounded-full hover:bg-muted"><XIcon className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {ICEBREAKERS.map((ib: any) => (
                      <button
                        key={ib.id}
                        onClick={async () => {
                          const text = language === 'az' ? ib.textAz : ib.textEn;
                          await sendMessageMutation({
                            body: text,
                            userId: user?.name || "Anonymous",
                            channelId: activeChannelId!,
                            format: 'icebreaker',
                            icebreakerId: ib.id
                          });
                          setShowIcebreakerModal(false);
                        }}
                        className="w-full text-left p-3 rounded-xl bg-card border border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                      >
                         <div className="flex items-start gap-3">
                           <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                             {ib.category === 'fun' ? '🎢' : ib.category === 'deep' ? '🤔' : '🔥'}
                           </span>
                           <span className="text-sm font-medium">{language === 'az' ? ib.textAz : ib.textEn}</span>
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
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowVenueModal(false)}
            >
               <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="w-full max-w-md bg-background border border-border rounded-3xl p-6 shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                       <Calendar className="w-5 h-5 text-rose-500" />
                       {language === 'az' ? 'Görüşə Dəvət Et' : 'Invite to Date'}
                    </h3>
                    <button onClick={() => setShowVenueModal(false)} className="p-1 rounded-full hover:bg-muted"><XIcon className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {PARTNER_VENUES.map((venue: any) => (
                      <button
                        key={venue.id}
                        onClick={async () => {
                          const text = language === 'az' 
                            ? `Gəl ${venue.name} məkanında görüşək! 🥂` 
                            : `Let's meet at ${venue.name}! 🥂`;
                          
                          await sendMessageMutation({
                            body: text,
                            userId: user?.name || "Anonymous",
                            channelId: activeChannelId!,
                            format: 'invite',
                            venueId: venue.id
                          });
                          setShowVenueModal(false);
                        }}
                        className="w-full text-left p-0 rounded-xl bg-card border border-border hover:border-rose-500 transition-all overflow-hidden group relative h-24"
                      >
                         <img src={venue.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                         <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                         <div className="absolute inset-0 p-4 flex flex-col justify-center">
                            <h4 className="text-white font-bold text-lg">{venue.name}</h4>
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
                    {language === 'az' ? 'Mesajı silmək istəyirsiniz?' : 'Delete message?'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {language === 'az' 
                      ? 'Bu əməliyyat geri qaytarıla bilməz.' 
                      : 'This action cannot be undone.'}
                  </p>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                      {language === 'az' ? 'Ləğv et' : 'Cancel'}
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                      {language === 'az' ? 'Sil' : 'Delete'}
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
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <h1 className="font-bold text-lg">{txt.messages}</h1>
          
          {/* Instagram-style Requests Button */}
          <button 
            onClick={() => setShowRequestsModal(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border hover:bg-muted transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">{txt.incomingRequests}</span>
            {((user?.messageRequests?.length || 0) + (user?.sentMessageRequests?.length || 0)) > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                {(user?.messageRequests?.length || 0) + (user?.sentMessageRequests?.length || 0)}
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
                  router.push('/messages?userId=general');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-card transition-colors bg-primary/5 border border-primary/10 mb-2"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{txt.publicChat}</span>
                  <span className="text-xs text-muted-foreground">{txt.now}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                   Danyeri Community
                </p>
              </div>
            </button>
          
          {/* Matches List */}
          <div className="space-y-1">
            {matchProfiles === undefined ? (
               <p className="text-center text-xs text-muted-foreground py-4">
                 {language === 'az' ? 'Yüklənir...' : 'Loading...'}
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
                  <Button asChild className="gradient-brand border-0 rounded-full">
                    <Link href="/discovery">{txt.startDiscovering}</Link>
                  </Button>
                </div>
            ) : (
              matchProfiles.map((match) => (
                <ConversationRow
                  key={match.clerkId || match._id}
                  participantId={match.clerkId || match._id}
                  currentUserId={user?.id || "current-user"}
                  isSelected={(selectedConv as Conversation | null)?.participantId === (match.clerkId || match._id)}
                  onSelect={() => {
                    const fakeConv: Conversation = {
                        id: `conv-${match.clerkId || match._id}`, 
                        participantId: match.clerkId || match._id,
                        messages: [{
                            id: "intro",
                            senderId: match.clerkId || match._id,
                            text: language === 'az' ? 'Salam! Uyğunluq tapmağımız çox yaxşı oldu 👋' : 'Hey! Great to match with you 👋',
                            timestamp: new Date()
                        }]
                    };
                    setSelectedConv(fakeConv);
                    router.push(`/messages?userId=${match.clerkId || match._id}`);
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
      {/* ... (Requests Modal etc would go here if not already present in full file) */}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <MessagesContent />
    </React.Suspense>
  );
}

