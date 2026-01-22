"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Search, Heart, MoreVertical, Phone, Video, Image, Gift, Check, X as XIcon, Mail, Clock, Trash2, Pencil, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MOCK_USERS } from "@/lib/mock-users";
import { BottomNav } from "@/components/Navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getChannelId, cn } from "@/lib/utils";
import { ConversationRow } from "@/components/messages/ConversationRow";
import { GiftModal } from "@/components/messages/GiftModal";
import { VirtualGift } from "@/lib/virtual-gifts";
import { StoriesBar } from "@/components/stories";
import { useToast } from "@/components/ui/toast";

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

export default function MessagesPage() {
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
  const [showGiftModal, setShowGiftModal] = useState(false);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  
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
    if (user?.matches.length) {
      const greeting = language === 'az' 
        ? 'Salam! Uyğunluq tapmağımız çox yaxşı oldu 👋'
        : 'Hey! Great to match with you 👋';
      const convs = user.matches.map(matchId => ({
        id: `conv-${matchId}`,
        participantId: matchId,
        messages: [{
          id: "1",
          senderId: matchId,
          text: greeting,
          timestamp: new Date(Date.now() - 3600000)
        }]
      }));
      setConversations(convs);
    }
  }, [isOnboarded, user, router, language]);

  // Handle deep link to specific user
  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    if (userIdParam && conversations.length > 0) {
      const conv = conversations.find(c => c.participantId === userIdParam);
      if (conv) {
        setSelectedConv(conv);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  const matchedUsers = MOCK_USERS.filter(u => user?.matches.includes(u.id));
  const getParticipant = (id: string) => MOCK_USERS.find(u => u.id === id);

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
  
  const sendMessageMutation = useMutation(api.messages.send);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convexMessages]);
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteMessageMutation({ 
        id: msgId as any, 
        userId: user?.name || "Anonymous", 
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
        userId: user?.name || "Anonymous",
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

    await sendMessageMutation({
      body: newMessage,
      userId: user?.name || "Anonymous", // Sending NAME for display, usually better to send ID and resolve name, but schema uses userId string
      channelId: activeChannelId
    });
    
    setNewMessage("");
  };

  // Add a "General Chat" option to the conversation list
  const generalChatConv: Conversation = {
     id: "general",
     participantId: "community",
     messages: [] 
  };

  // Chat View
  if (selectedConv) {
    const isGeneral = selectedConv.id === "general";
    const participant = !isGeneral ? getParticipant(selectedConv.participantId) : null;
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setSelectedConv(null)} // Go back to list
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
                      className="w-10 h-10 rounded-full" 
                      alt={participant?.name}
                    />
                  )}
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                    isGeneral || friendPresence?.isOnline ? "bg-[#20D5A0]" : "bg-red-500"
                  )} />
                </div>
                <div>
                  <h2 className="font-semibold">{isGeneral ? "Danyeri Community" : participant?.name}</h2>
                  <p className={cn("text-xs", 
                    isGeneral || friendPresence?.isOnline ? "text-[#20D5A0]" : "text-red-500"
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
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
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
               timestamp: new Date(msg._creationTime)
             })) || [];

             // If we have remote messages, prefer them. If not, and it's a new private match, show the local intro message.
             // However, general chat (Aura Community) should purely rely on remote or stay empty.
             const isPrivateChat = selectedConv.id !== "general";
             const showLocalFallback = remoteMessages.length === 0 && isPrivateChat;
             
             const displayMessages = showLocalFallback ? selectedConv.messages : remoteMessages;

             if (displayMessages.length === 0 && !isGeneral) {
                // If absolutely no messages (not even local), show match banner (handled below if we return null here? No, let's keep array empty)
             }

             return displayMessages.map((msg) => {
               const isMe = msg.senderId === user?.id || msg.senderId === "current-user" || msg.senderId === user?.name;
               // Check if message is less than 15 mins old
               const isRecent = (Date.now() - new Date(msg.timestamp).getTime() < 15 * 60 * 1000);
               const canDelete = isMe && isRecent;

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
                       {msg.senderId === "current-user" ? user?.name : msg.senderId}
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
                          ) : (
                            <p>{msg.text}</p>
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

        {/* Input */}
        <div className="sticky bottom-0 glass border-t border-border/50 p-4 safe-bottom">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <Image className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full shrink-0"
              onClick={() => setShowGiftModal(true)}
            >
              <Gift className="w-5 h-5 text-primary" />
            </Button>
            <Input 
              placeholder={txt.messagePlaceholder}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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

        {/* Gift Modal */}
        <GiftModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          onSendGift={(gift: VirtualGift) => {
            // Demo: Send gift as a message
            const giftMsg = `🎁 ${gift.emoji} ${language === 'az' ? gift.nameAz : gift.name}`;
            setNewMessage(giftMsg);
            handleSendMessage();
          }}
          recipientName={participant?.name || ""}
          language={language as "en" | "az"}
        />
        
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
          
          {conversations.length > 0 || true ? ( // Always show list because of Community Chat
            <div className="space-y-1">
               {/* Community Chat */}
               <button
                  onClick={() => setSelectedConv(generalChatConv)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-card transition-colors bg-primary/5 border border-primary/10 mb-2"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                      A
                    </div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">Aura Community</span>
                      <span className="text-xs text-muted-foreground">{txt.now}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {txt.publicChat}
                    </p>
                  </div>
                </button>

              {/* Matches List based on User Matches (Convex + Local sync) */}
              {user?.matches.map(matchId => (
                <ConversationRow
                  key={matchId}
                  participantId={matchId}
                  currentUserId={user?.id || "current-user"}
                  isSelected={(selectedConv as Conversation | null)?.participantId === matchId}
                  onSelect={() => {
                    const fakeConv: Conversation = {
                        id: `conv-${matchId}`, // Internal ID, doesn't matter much as fetching uses channelId
                        participantId: matchId,
                        messages: [{ // Keep the fake welcome message for fallback
                            id: "intro",
                            senderId: matchId,
                            text: language === 'az' ? 'Salam! Uyğunluq tapmağımız çox yaxşı oldu 👋' : 'Hey! Great to match with you 👋',
                            timestamp: new Date()
                        }]
                    };
                    setSelectedConv(fakeConv);
                  }}
                />
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </main>

      <BottomNav />

      {/* Instagram-style Message Requests Modal */}
      <AnimatePresence>
        {showRequestsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRequestsModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-background rounded-t-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
                <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">{txt.messageRequests}</h2>
                  <button
                    onClick={() => setShowRequestsModal(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(85vh-80px)] pb-8">
                {/* Incoming Requests Section */}
                <div className="px-4 py-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    {txt.incomingRequests}
                    {user?.messageRequests && user.messageRequests.length > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold">
                        {user.messageRequests.length}
                      </span>
                    )}
                  </h3>
                  
                  {user?.messageRequests && user.messageRequests.length > 0 ? (
                    <div className="space-y-3">
                      {user.messageRequests.map((requesterId, index) => {
                        const requester = MOCK_USERS.find(u => u.id === requesterId);
                        if (!requester) return null;
                        return (
                          <motion.div
                            key={requesterId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20"
                          >
                            <img 
                              src={requester.avatar}
                              alt={requester.name}
                              className="w-14 h-14 rounded-full border-2 border-blue-500/30 object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{requester.name}, {requester.age}</p>
                              <p className="text-sm text-muted-foreground">{txt.wantsToChat}</p>
                              <p className="text-xs text-muted-foreground/70 mt-0.5">{requester.location}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  declineMessageRequest(requesterId);
                                  showToast({ title: txt.requestDeclined, type: "info", duration: 2000 });
                                }}
                                className="w-11 h-11 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all hover:scale-105"
                                title={txt.decline}
                              >
                                <XIcon className="w-5 h-5 text-red-500" />
                              </button>
                              <button
                                onClick={() => {
                                  acceptMessageRequest(requesterId);
                                  showToast({ title: txt.requestAccepted, type: "match", duration: 3000 });
                                }}
                                className="w-11 h-11 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-all hover:scale-105"
                                title={txt.accept}
                              >
                                <Check className="w-5 h-5 text-green-500" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-7 h-7 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground">{txt.noRequests}</p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border mx-4" />

                {/* Sent Requests Section */}
                <div className="px-4 py-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    {txt.sentRequests}
                    {user?.sentMessageRequests && user.sentMessageRequests.length > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold">
                        {user.sentMessageRequests.length}
                      </span>
                    )}
                  </h3>
                  
                  {user?.sentMessageRequests && user.sentMessageRequests.length > 0 ? (
                    <div className="space-y-3">
                      {user.sentMessageRequests.map((targetId, index) => {
                        const targetUser = MOCK_USERS.find(u => u.id === targetId);
                        if (!targetUser) return null;
                        return (
                          <motion.div
                            key={targetId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/5 to-yellow-500/5 border border-orange-500/20"
                          >
                            <img 
                              src={targetUser.avatar}
                              alt={targetUser.name}
                              className="w-14 h-14 rounded-full border-2 border-orange-500/30 object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{targetUser.name}, {targetUser.age}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {txt.pending}
                              </p>
                            </div>
                            <button
                              onClick={() => cancelMessageRequest(targetId)}
                              className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                            >
                              {language === "az" ? "Ləğv et" : "Cancel"}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-7 h-7 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground">{txt.noSentRequests}</p>
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
