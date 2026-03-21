import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../lib/api";
import { Plus } from "../../lib/icons";
import { Colors } from "../../lib/colors";
import { StoryViewer, type StoryUserGroup } from "./StoryViewer";
import { AddStoryModal } from "./AddStoryModal";

export function StoriesBar() {
  const { userId } = useAuth();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [initialUserIndex, setInitialUserIndex] = useState(0);

  const feed = useQuery(api.stories.getFeed, userId ? {} : "skip") as any[] | undefined;

  const users = useMemo<StoryUserGroup[]>(() => {
    if (!feed) return [];
    return feed.map((u: any) => ({
      userId: String(u.userId),
      userName: String(u.userName ?? "User"),
      userAvatar: String(u.userAvatar ?? ""),
      hasUnviewed: !!u.hasUnviewed,
      stories: (u.stories ?? []).map((s: any) => ({
        id: String(s.id),
        userId: String(s.userId),
        mediaUrl: String(s.mediaUrl),
        mediaType: String(s.mediaType ?? "image"),
        caption: s.caption ? String(s.caption) : undefined,
        createdAt: Number(s.createdAt ?? 0),
        expiresAt: Number(s.expiresAt ?? 0),
      })),
    }));
  }, [feed]);

  if (!userId) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>HEKAYƏLƏR</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          onPress={() => setAddOpen(true)}
          activeOpacity={0.85}
          style={styles.storyItem}
        >
          <View style={styles.addRing}>
            <View style={styles.addInner}>
              <Plus size={24} color={Colors.mutedForeground} />
            </View>
          </View>
          <Text style={styles.storyName} numberOfLines={1}>
            Əlavə et
          </Text>
        </TouchableOpacity>

        {users.map((u, idx) => (
          <TouchableOpacity
            key={u.userId}
            onPress={() => {
              setInitialUserIndex(idx);
              setViewerOpen(true);
            }}
            activeOpacity={0.85}
            style={styles.storyItem}
          >
            <View style={styles.ringOuter}>
              {u.hasUnviewed ? (
                <LinearGradient
                  colors={["#f59e0b", "#ef4444", "#d946ef"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ringGradient}
                >
                  <View style={styles.ringInner}>
                    <Image
                      source={u.userAvatar ? { uri: u.userAvatar } : undefined}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  </View>
                </LinearGradient>
              ) : (
                <View style={[styles.ringGradient, { backgroundColor: Colors.border }]}>
                  <View style={styles.ringInner}>
                    <Image
                      source={u.userAvatar ? { uri: u.userAvatar } : undefined}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  </View>
                </View>
              )}
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
              {u.userName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <StoryViewer
        visible={viewerOpen}
        onClose={() => setViewerOpen(false)}
        userStories={users}
        initialUserIndex={initialUserIndex}
      />

      <AddStoryModal visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Web: px-4 py-4
  wrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  label: {
    color: Colors.mutedForeground,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  // Web: gap-5
  scrollContent: { paddingRight: 16, gap: 20 },
  storyItem: { width: 74, alignItems: "center" },
  ringOuter: { width: 56, height: 56, marginBottom: 6 },
  ringGradient: { width: 56, height: 56, borderRadius: 28, padding: 2.5 },
  ringInner: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: Colors.background,
    padding: 2,
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%", borderRadius: 28, backgroundColor: Colors.surfaceDark },
  storyName: {
    color: Colors.foreground,
    fontSize: 11,
    fontWeight: "500",
    maxWidth: 72,
  },
  addRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(161,161,170,0.45)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  addInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(20,22,40,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
});

