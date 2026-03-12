import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
  const { id: recipientId } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Get recipient user
  const recipient = useQuery(
    api.users.getUser,
    recipientId ? { clerkId: recipientId } : "skip"
  );

  // Get match to find the matchId
  const matches = useQuery(api.matches.list, userId ? { userId } : "skip");
  
  // Find messages for this conversation
  const matchRecord = useQuery(
    api.matches.getMatchBetween,
    userId && recipientId ? { user1Id: userId, user2Id: recipientId } : "skip"
  );

  const messages = useQuery(
    api.messages.list,
    matchRecord?._id ? { matchId: matchRecord._id } : "skip"
  );

  const sendMessage = useMutation(api.messages.send);

  const handleSend = async () => {
    if (!text.trim() || !userId || !matchRecord?._id) return;
    const msg = text.trim();
    setText("");
    try {
      await sendMessage({
        body: msg,
        userId: userId,
        matchId: matchRecord._id,
      });
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.userId === userId;
    return (
      <View style={[msgStyles.bubble, isMe ? msgStyles.myBubble : msgStyles.theirBubble]}>
        <Text style={[msgStyles.text, isMe ? msgStyles.myText : msgStyles.theirText]}>
          {item.body}
        </Text>
        <Text style={[msgStyles.time, isMe ? msgStyles.myTime : msgStyles.theirTime]}>
          {new Date(item._creationTime).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: recipient?.name || "Söhbət",
          headerStyle: { backgroundColor: "#1a1a2e" },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            recipient?.avatar ? (
              <Image source={{ uri: recipient.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
            ) : null
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {messages === undefined ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e94057" />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatEmoji}>👋</Text>
            <Text style={styles.emptyChatText}>
              {recipient?.name || "İstifadəçi"} ilə söhbətə başlayın!
            </Text>
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

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Mesaj yazın..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={20} color={text.trim() ? "#fff" : "#555"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  messagesList: { padding: 16, paddingBottom: 8 },
  emptyChat: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyChatEmoji: { fontSize: 48, marginBottom: 12 },
  emptyChatText: { color: "#888", fontSize: 15 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#1a1a2e",
  },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e94057",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendBtnDisabled: { backgroundColor: "rgba(255,255,255,0.08)" },
});

const msgStyles = StyleSheet.create({
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#e94057",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: 15, lineHeight: 20 },
  myText: { color: "#fff" },
  theirText: { color: "#ddd" },
  time: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  myTime: { color: "rgba(255,255,255,0.6)" },
  theirTime: { color: "rgba(255,255,255,0.4)" },
});
