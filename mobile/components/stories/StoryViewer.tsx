import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../lib/api";
import { ArrowLeft, Send, X } from "../../lib/icons";
import { Colors } from "../../lib/colors";

export type StoryItem = {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: string; // "image" | "video"
  caption?: string;
  createdAt: number;
  expiresAt: number;
};

export type StoryUserGroup = {
  userId: string;
  userName: string;
  userAvatar: string;
  hasUnviewed: boolean;
  stories: StoryItem[];
};

function getChannelId(uid1: string, uid2: string) {
  const sorted = [uid1, uid2].sort();
  return `match-${sorted[0]}-${sorted[1]}`;
}

export function StoryViewer({
  visible,
  onClose,
  userStories,
  initialUserIndex,
}: {
  visible: boolean;
  onClose: () => void;
  userStories: StoryUserGroup[];
  initialUserIndex: number;
}) {
  const { userId } = useAuth();
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (visible) {
      setUserIndex(initialUserIndex);
      setStoryIndex(0);
      setReply("");
    }
  }, [visible, initialUserIndex]);

  const currentUser = userStories[userIndex];
  const currentStory = currentUser?.stories?.[storyIndex];

  const markViewed = useMutation(api.stories.markViewed);
  const sendMessage = useMutation(api.messages.send);
  const sendRequest = useMutation(api.matches.sendRequest);

  const matchStatus = useQuery(
    api.matches.getMatchWithUser,
    visible && currentUser?.userId && userId && currentUser.userId !== userId
      ? { otherUserId: currentUser.userId }
      : "skip",
  ) as any;

  const canMessage = useMemo(() => {
    if (!userId || !currentUser) return false;
    if (currentUser.userId === userId) return false;
    return matchStatus?.status === "accepted";
  }, [currentUser, matchStatus?.status, userId]);

  useEffect(() => {
    if (!visible || !currentStory) return;
    markViewed({ storyId: currentStory.id as any }).catch(() => {});
  }, [currentStory?.id, markViewed, visible]);

  const goPrev = () => {
    if (!currentUser) return;
    if (storyIndex > 0) return setStoryIndex((s) => s - 1);
    if (userIndex > 0) {
      const newUser = userStories[userIndex - 1];
      setUserIndex((u) => u - 1);
      setStoryIndex(Math.max(0, (newUser?.stories?.length ?? 1) - 1));
    }
  };

  const goNext = () => {
    if (!currentUser) return;
    if (storyIndex < currentUser.stories.length - 1) return setStoryIndex((s) => s + 1);
    if (userIndex < userStories.length - 1) {
      setUserIndex((u) => u + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handleSend = async () => {
    if (!userId || !currentUser || !currentStory) return;
    if (!reply.trim()) return;
    const msg = reply.trim();
    setReply("");

    const body = `[STORY:${currentStory.mediaUrl}] ${msg}`;

    try {
      if (canMessage) {
        await sendMessage({
          body,
          userId,
          channelId: getChannelId(userId, currentUser.userId),
          format: "text",
        });
      } else {
        await sendRequest({ senderId: userId, receiverId: currentUser.userId });
      }
    } catch (_) {}
  };

  if (!currentUser || !currentStory) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBtn} onPress={onClose} activeOpacity={0.8}>
            <ArrowLeft size={22} color={Colors.foreground} />
          </TouchableOpacity>
          <View style={styles.userMeta}>
            <Image
              source={currentUser.userAvatar ? { uri: currentUser.userAvatar } : undefined}
              style={styles.userAvatar}
              contentFit="cover"
            />
            <Text style={styles.userName} numberOfLines={1}>
              {currentUser.userName}
            </Text>
          </View>
          <TouchableOpacity style={styles.topBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={20} color={Colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.mediaWrap}>
          <Pressable style={styles.tapZoneLeft} onPress={goPrev} />
          <Pressable style={styles.tapZoneRight} onPress={goNext} />

          {currentStory.mediaType === "video" ? (
            <Video
              source={{ uri: currentStory.mediaUrl }}
              style={styles.media}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
            />
          ) : (
            <Image source={{ uri: currentStory.mediaUrl }} style={styles.media} contentFit="cover" />
          )}

          {!!currentStory.caption && (
            <View style={styles.captionWrap}>
              <Text style={styles.captionText} numberOfLines={3}>
                {currentStory.caption}
              </Text>
            </View>
          )}
        </View>

        {currentUser.userId !== userId && (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={80}
          >
            <View style={styles.replyBar}>
              <TextInput
                value={reply}
                onChangeText={setReply}
                placeholder={canMessage ? "Hekayəyə cavab yaz..." : "Cavab yaz (istək göndəriləcək)"}
                placeholderTextColor={Colors.mutedForeground}
                style={styles.replyInput}
              />
              <TouchableOpacity
                onPress={handleSend}
                activeOpacity={0.85}
                disabled={!reply.trim()}
                style={[styles.sendBtn, !reply.trim() && styles.sendBtnDisabled]}
              >
                <Send size={18} color={reply.trim() ? Colors.foreground : Colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)" },
  topBar: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  userMeta: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingHorizontal: 6 },
  userAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.surfaceDark },
  userName: { color: Colors.foreground, fontSize: 14, fontWeight: "700", maxWidth: 220 },
  mediaWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  media: { width: "100%", height: "100%" },
  tapZoneLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: "40%", zIndex: 5 },
  tapZoneRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", zIndex: 5 },
  captionWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  captionText: { color: Colors.foreground, fontSize: 13, lineHeight: 18 },
  replyBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  replyInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    color: Colors.foreground,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: "rgba(255,255,255,0.08)" },
});

