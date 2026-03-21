import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../lib/api";
import { ArrowLeft, MessageCircle, Image as ImageIcon, Send, Trash2, CheckCircle2, Heart, Sparkles, Calendar, Pencil, X } from "../../lib/icons";
import { Colors } from "../../lib/colors";
import { ICEBREAKERS } from "../../lib/icebreakers";
import { PARTNER_VENUES } from "../../lib/partner-venues";

const getChannelId = (uid1: string, uid2: string) => {
  const sorted = [uid1, uid2].sort();
  return `match-${sorted[0]}-${sorted[1]}`;
};

export default function ChatScreen() {
  const { id: recipientId } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const isGeneral = recipientId === "general";
  const effectiveChannelId = isGeneral
    ? "general"
    : userId && recipientId
      ? getChannelId(userId, recipientId)
      : null;

  const recipient = useQuery(
    api.users.getUser,
    recipientId && !isGeneral ? { clerkId: recipientId } : "skip"
  );

  const matchStatus = useQuery(
    api.matches.getMatchWithUser,
    userId && recipientId && !isGeneral ? { otherUserId: recipientId } : "skip"
  );
  const canMessage = isGeneral || matchStatus?.status === "accepted";
  const isPendingRequest = !isGeneral && matchStatus?.status === "request";
  const isRequestSender = isPendingRequest && matchStatus?.isSender === true;

  const messages = useQuery(
    api.messages.list,
    effectiveChannelId ? { channelId: effectiveChannelId } : "skip"
  );

  const sendMessage = useMutation(api.messages.send);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const markGeneralSeenMutation = useMutation(api.messages.markGeneralSeen);
  const markReadMutation = useMutation(api.messages.markRead);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const generalSenderIds = useMemo(() => {
    if (!messages || !isGeneral) return [];
    return Array.from(new Set(messages.map((m: any) => m.userId).filter(Boolean)));
  }, [messages, isGeneral]);

  const generalSenderProfiles = useQuery(
    api.users.getUsersByIds,
    isGeneral && generalSenderIds.length > 0 ? { ids: generalSenderIds } : "skip"
  );

  const senderNameMap = useMemo(() => {
    const map: Record<string, { name: string; avatar?: string }> = {};
    if (Array.isArray(generalSenderProfiles)) {
      generalSenderProfiles.forEach((u: any) => {
        const id = u.clerkId || u._id;
        if (id) map[id] = { name: u.name || "İstifadəçi", avatar: u.avatar };
      });
    }
    return map;
  }, [generalSenderProfiles]);

  useEffect(() => {
    if (isGeneral && userId) {
      markGeneralSeenMutation().catch(() => {});
    }
  }, [isGeneral, userId, markGeneralSeenMutation]);

  useEffect(() => {
    if (!isGeneral && effectiveChannelId && userId && matchStatus?.status === "accepted") {
      markReadMutation({ channelId: effectiveChannelId, userId }).catch(() => {});
    }
  }, [isGeneral, effectiveChannelId, userId, matchStatus?.status, markReadMutation]);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [icebreakerModalVisible, setIcebreakerModalVisible] = useState(false);
  const [venueModalVisible, setVenueModalVisible] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    if (!text.trim() || !userId || !effectiveChannelId || !canMessage) return;
    const msg = text.trim();
    setText("");
    try {
      if (editingMessageId) {
        await editMessage({ id: editingMessageId as any, userId, newBody: msg });
        setEditingMessageId(null);
      } else {
        await sendMessage({ body: msg, userId, channelId: effectiveChannelId });
      }
    } catch (e) {
      console.error("Failed to send:", e);
    }
  };

  const handleSendImage = async () => {
    if (!userId || !effectiveChannelId || !canMessage) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İcazə lazımdır", "Qalereyaya icazə verin");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 600 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(manipulated.uri);
      const blob = await response.blob();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const data = await uploadRes.json();
      if (data?.storageId) {
        await sendMessage({
          body: data.storageId,
          userId,
          channelId: effectiveChannelId,
          format: "image",
        });
      }
    } catch (err) {
      Alert.alert("Xəta", "Şəkil göndərilə bilmədi");
    }
  };

  const handleMessageOptions = (item: any) => {
    Alert.alert("Mesaj variantları", "Nə etmək istəyirsiniz?", [
      { text: "Ləğv et", style: "cancel" },
      {
        text: "Düzəliş et",
        onPress: () => {
          setEditingMessageId(item._id);
          setText(item.body || "");
          setTimeout(() => inputRef.current?.focus(), 100);
          setSelectedMessage(null);
        },
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMessage({ id: item._id as any, userId: userId! });
          } catch (e) { /* ignore */ }
          setSelectedMessage(null);
        },
      },
    ]);
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isMe = item.userId === userId;
    const sender = isGeneral && !isMe ? senderNameMap[item.userId] : null;
    const isIcebreaker = item.format === "icebreaker";
    const isInvite = item.format === "invite" && item.venueId;
    const isImage = item.format === "image" || item.body?.startsWith("[image]");
    const imageUrl = item.imageUrl ?? (item.body?.startsWith("[image]") ? item.body.replace("[image]", "") : null);
    const time = new Date(item._creationTime).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
    const isSelected = selectedMessage === item._id;

    const storyMatch = typeof item.body === "string" ? item.body.match(/^\[STORY:([^\]]+)\]\s*(.*)/) : null;
    const storyUrl = storyMatch ? storyMatch[1] : null;
    const storyText = storyMatch ? storyMatch[2] : null;

    const prevMsg = index > 0 ? messages![index - 1] : null;
    const showDateSep = !prevMsg ||
      new Date(item._creationTime).toDateString() !== new Date(prevMsg._creationTime).toDateString();

    return (
      <View style={{ marginBottom: 12 }}>
        {showDateSep && (
          <View style={msgStyles.dateSep}>
            <Text style={msgStyles.dateSepText}>
              {new Date(item._creationTime).toLocaleDateString("az-AZ", { day: "numeric", month: "long" })}
            </Text>
          </View>
        )}
        <View style={[msgStyles.bubbleWrap, isMe ? msgStyles.myWrap : msgStyles.theirWrap]}>
          <View style={[msgStyles.messageRow, isMe ? msgStyles.messageRowMe : msgStyles.messageRowThem]}>
            {/* Avatar for Söhbətgah them */}
            {isGeneral && !isMe && (
              <View style={msgStyles.avatarCol}>
                {sender?.avatar ? (
                  <Image source={{ uri: sender.avatar }} style={msgStyles.senderAvatar} contentFit="cover" />
                ) : (
                  <View style={[msgStyles.senderAvatar, { backgroundColor: Colors.surfaceDark }]} />
                )}
              </View>
            )}

            <View style={[msgStyles.contentCol, isMe ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}>
              {/* Söhbətgah Name */}
              {isGeneral && !isMe && sender && (
                <Text style={msgStyles.senderName}>{sender.name}</Text>
              )}

              <Pressable
                onLongPress={() => isMe ? handleMessageOptions(item) : undefined}
                style={[
                  msgStyles.bubble, 
                  isMe ? msgStyles.myBubble : msgStyles.theirBubble,
                  isSelected && { opacity: 0.8 }
                ]}
              >
                {storyUrl ? (
                  <View style={msgStyles.storyWrap}>
                    <View style={msgStyles.storyHeaderRow}>
                      <View style={msgStyles.storyThumb}>
                        <Image source={{ uri: storyUrl }} style={msgStyles.storyThumbImg} contentFit="cover" />
                      </View>
                      <Text style={msgStyles.storyLabel}>Hekayəyə cavab</Text>
                    </View>
                    <Text style={[msgStyles.text, isMe ? msgStyles.myText : msgStyles.theirText]}>
                      {storyText ?? ""}
                    </Text>
                  </View>
                ) : isIcebreaker ? (
                  <View style={{ flexDirection: "column", gap: 6, width: 220 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Sparkles size={14} color={isMe ? "#fff" : Colors.mutedForeground} />
                      <Text style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase", color: isMe ? "rgba(255,255,255,0.7)" : Colors.mutedForeground }}>
                        Icebreaker
                      </Text>
                    </View>
                    <Text style={[msgStyles.text, isMe ? msgStyles.myText : msgStyles.theirText, { fontSize: 17, fontWeight: "600", lineHeight: 24 }]}>
                      {item.body}
                    </Text>
                  </View>
                ) : isInvite ? (
                  <View style={{ width: 220, flexDirection: "column" }}>
                    {(() => {
                      const venue = PARTNER_VENUES.find((v: any) => v.id === item.venueId);
                      if (!venue) return <Text style={[msgStyles.text, isMe ? msgStyles.myText : msgStyles.theirText]}>{item.body}</Text>;
                      return (
                        <View style={{ flexDirection: "column" }}>
                          <View style={{ height: 120, width: "100%", marginBottom: 8, overflow: "hidden", borderRadius: 12 }}>
                            <Image source={{ uri: venue.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                            <View style={{ position: "absolute", bottom: 8, left: 8, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                              <Text style={{ fontSize: 10, fontWeight: "bold", color: "#000" }}>{venue.name}</Text>
                            </View>
                          </View>
                          <Text style={[msgStyles.text, isMe ? msgStyles.myText : msgStyles.theirText, { fontWeight: "bold", marginBottom: 2 }]}>Gəl burada görüşək! 🥂</Text>
                          <Text style={{ fontSize: 12, color: isMe ? "rgba(255,255,255,0.8)" : Colors.mutedForeground, marginBottom: 8 }}>{venue.address}</Text>
                          <TouchableOpacity onPress={() => router.push("/venues")} style={{ backgroundColor: isMe ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)", paddingVertical: 8, borderRadius: 8, alignItems: "center" }}>
                             <Text style={{ fontSize: 12, fontWeight: "600", color: isMe ? "#fff" : Colors.foreground }}>Məkana bax</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })()}
                  </View>
                ) : isImage && imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={msgStyles.imageMsg} contentFit="cover" />
                ) : (
                  <Text style={[msgStyles.text, isMe ? msgStyles.myText : msgStyles.theirText]}>
                    {item.body}
                  </Text>
                )}
              </Pressable>

              {/* Metadata row under bubble */}
              <View style={msgStyles.metaRow}>
                <Text style={msgStyles.time}>{time}</Text>
                {item.editedAt && (
                   <Text style={[msgStyles.time, { marginLeft: 4, fontStyle: "italic" }]}>Redaktə edilib</Text>
                )}
                {isMe && !isGeneral && (
                  item.isRead ? (
                    <View style={msgStyles.doubleCheck}>
                      <CheckCircle2 size={12} color="#3b82f6" />
                      <View style={{ marginLeft: -6 }}>
                        <CheckCircle2 size={12} color="#3b82f6" />
                      </View>
                    </View>
                  ) : (
                    <CheckCircle2 size={12} color={Colors.mutedForeground} style={{ marginLeft: 4 }} />
                  )
                )}
              </View>

              {isSelected && isMe && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 4, justifyContent: "flex-end" }}>
                  <TouchableOpacity 
                    style={[msgStyles.deleteBtn, { backgroundColor: "rgba(255,255,255,0.05)" }]} 
                    onPress={() => {
                      setEditingMessageId(item._id);
                      setText(item.body || "");
                      setTimeout(() => inputRef.current?.focus(), 100);
                      setSelectedMessage(null);
                    }}
                  >
                    <Pencil size={14} color={Colors.foreground} />
                    <Text style={[msgStyles.deleteBtnText, { color: Colors.foreground }]}>Düzəliş et</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={msgStyles.deleteBtn} 
                    onPress={() => {
                      deleteMessage({ id: item._id as any, userId: userId! });
                      setSelectedMessage(null);
                    }}
                  >
                    <Trash2 size={14} color={Colors.primary} />
                    <Text style={msgStyles.deleteBtnText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const loading = messages === undefined || (!isGeneral && matchStatus === undefined);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                <ArrowLeft size={24} color={Colors.foreground} />
              </TouchableOpacity>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View>
                  {isGeneral ? (
                    <View style={styles.headerGeneralIcon}>
                      <MessageCircle size={20} color="#fff" />
                    </View>
                  ) : (
                    <View style={styles.headerAvatarWrap}>
                      <Image source={{ uri: recipient?.avatar || "https://danyeri.az/placeholder-avatar.svg" }} style={styles.headerAvatar} contentFit="cover" />
                    </View>
                  )}
                  {/* Online indicator dot */}
                  <View style={styles.onlineBadge} />
                </View>
                <View>
                  <Text style={styles.headerTitleText}>
                    {isGeneral ? "Söhbətgah" : (recipient?.name || "Söhbət")}
                  </Text>
                  <Text style={styles.headerSubtitleText}>
                    İndi aktivdir
                  </Text>
                </View>
              </View>
            </View>
          ),
          headerRight: () => null, // Remove the old right icon setup
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : isPendingRequest ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatEmoji}>✉️</Text>
            <Text style={styles.emptyChatText}>
              {isRequestSender
                ? "İstəyiniz gözləyir. Cavab gələnə qədər gözləyin."
                : "Bu söhbətə başlamaq üçün mesaj istəyini qəbul edin (Mesajlar → Mesaj İstəkləri)."}
            </Text>
          </View>
        ) : !canMessage ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatEmoji}>🔒</Text>
            <Text style={styles.emptyChatText}>Mesaj göndərmək üçün qarşılıqlı match lazımdır</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyChat}>
            {isGeneral ? (
              <>
                <Text style={styles.emptyChatEmoji}>👋</Text>
                <Text style={styles.emptyChatText}>Söhbətgahda mesaj yazmağa başlayın!</Text>
              </>
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <View style={styles.matchBanner}>
                  <Heart size={16} color={Colors.primary} fill={Colors.primary} />
                  <Text style={styles.matchBannerText}>Təbriklər, uyğunlaşdınız!</Text>
                </View>
                <Text style={[styles.emptyChatText, { marginTop: 12 }]}>
                  {recipient?.name || "İstifadəçi"} ilə söhbətə başlayın!
                </Text>
              </View>
            )}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn} onPress={handleSendImage}>
            <ImageIcon size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachBtn} onPress={() => setIcebreakerModalVisible(true)}>
            <Sparkles size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachBtn} onPress={() => setVenueModalVisible(true)}>
            <Calendar size={20} color="#f43f5e" />
          </TouchableOpacity>

          {editingMessageId && (
            <TouchableOpacity 
              style={{ position: "absolute", top: -30, right: 10, flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
              onPress={() => {
                setEditingMessageId(null);
                setText("");
              }}
            >
              <Pencil size={12} color={Colors.mutedForeground} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>Redaktə</Text>
              <X size={14} color={Colors.mutedForeground} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}

          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={editingMessageId ? "Düzəliş edin..." : "Mesaj..."}
            placeholderTextColor={Colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || !canMessage}
          >
            <Send size={18} color={text.trim() ? "#fff" : "rgba(255,255,255,0.4)"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={icebreakerModalVisible} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIcebreakerModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Buzqıranlar</Text>
            <ScrollView style={{ width: "100%", maxHeight: 400 }}>
              {ICEBREAKERS.map((item: any, i: number) => (
                <TouchableOpacity 
                   key={i} 
                   style={styles.modalItem}
                   onPress={() => {
                      sendMessage({ body: item.textAz, userId: userId!, channelId: effectiveChannelId!, format: "icebreaker" });
                      setIcebreakerModalVisible(false);
                   }}
                >
                  <Text style={styles.modalItemText}>{item.textAz}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={venueModalVisible} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVenueModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Məkan təklifi</Text>
            <ScrollView style={{ width: "100%", maxHeight: 400 }}>
              {PARTNER_VENUES.map((venue: any) => (
                <TouchableOpacity 
                   key={venue.id} 
                   style={styles.modalItem}
                   onPress={() => {
                      sendMessage({ body: venue.description, userId: userId!, channelId: effectiveChannelId!, format: "invite", venueId: venue.id });
                      setVenueModalVisible(false);
                   }}
                >
                  <Image source={{ uri: venue.image }} style={{ width: 44, height: 44, borderRadius: 8, marginRight: 12 }} />
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={styles.modalItemText}>{venue.name}</Text>
                    <Text style={{ fontSize: 13, color: Colors.mutedForeground }}>{venue.category}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, alignItems: "center"
  },
  modalTitle: {
    fontSize: 18, fontWeight: "bold", color: Colors.foreground, marginBottom: 16
  },
  modalItem: {
    flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)"
  },
  modalItemText: {
    fontSize: 16, color: Colors.foreground
  },
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerGeneralIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e11d48", // Rose/Pink
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f43f5e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  headerAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceDark,
    overflow: "hidden",
  },
  headerAvatar: {
    width: "100%",
    height: "100%",
  },
  onlineBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#20D5A0",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.foreground,
  },
  headerSubtitleText: {
    fontSize: 11,
    color: "#20D5A0",
    marginTop: 2,
  },
  messagesList: { padding: 16, paddingBottom: 8 },
  emptyChat: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyChatEmoji: { fontSize: 48, marginBottom: 12 },
  emptyChatText: { color: Colors.mutedForeground, fontSize: 15, textAlign: "center", paddingHorizontal: 32 },
  matchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primaryAlpha10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  matchBannerText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  attachBtn: {
    width: 32,
    height: 32,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 12 : 11,
    paddingBottom: Platform.OS === "ios" ? 12 : 11,
    color: Colors.foreground,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 44,
    marginLeft: 4,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#be185d", 
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  sendBtnDisabled: { backgroundColor: "rgba(255,255,255,0.08)" },
});

const msgStyles = StyleSheet.create({
  dateSep: { alignItems: "center", marginVertical: 16 },
  dateSepText: { color: Colors.mutedForeground, fontSize: 12, backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  bubbleWrap: { width: "100%" },
  myWrap: { alignItems: "flex-end" },
  theirWrap: { alignItems: "flex-start" },
  messageRow: { flexDirection: "row", maxWidth: "85%" },
  messageRowMe: { flexDirection: "row-reverse" },
  messageRowThem: { flexDirection: "row" },
  avatarCol: { width: 32, marginRight: 8, marginTop: 4 },
  contentCol: { flexShrink: 1, minWidth: 40 },
  senderAvatar: { width: 32, height: 32, borderRadius: 16 },
  senderName: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.5)", marginLeft: 4, marginBottom: 4 },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myBubble: { 
    backgroundColor: Colors.primary, 
    borderBottomRightRadius: 4 
  },
  theirBubble: { 
    backgroundColor: Colors.card, 
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4 
  },
  text: { fontSize: 16, lineHeight: 22 },
  myText: { color: "#fff" },
  theirText: { color: Colors.foreground },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4, paddingHorizontal: 4 },
  time: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  doubleCheck: { flexDirection: "row", alignItems: "center", marginLeft: 4 },
  imageMsg: { width: 200, height: 200, borderRadius: 14 },
  storyWrap: { gap: 10, minWidth: 140 },
  storyHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  storyThumb: {
    width: 32,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  storyThumbImg: { width: "100%", height: "100%" },
  storyLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.8)", textTransform: "uppercase" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primaryAlpha10,
    borderRadius: 8,
  },
  deleteBtnText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
});
