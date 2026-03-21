import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Switch,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { api } from "../../lib/api";
import { X, Camera, Check } from "../../lib/icons";
import { Colors } from "../../lib/colors";

type PickedMedia =
  | null
  | {
      uri: string;
      type: "image" | "video";
      mimeType?: string;
    };

export function AddStoryModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<PickedMedia>(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const generateUploadUrl = useMutation(api.stories.generateUploadUrl);
  const createStory = useMutation(api.stories.create);

  const mediaLabel = useMemo(() => {
    if (!picked) return "Media seçin";
    return picked.type === "video" ? "Video seçildi" : "Şəkil seçildi";
  }, [picked]);

  const reset = () => {
    setPicked(null);
    setCaption("");
    setIsPublic(false);
    setIsUploading(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      reset();
      onClose();
    }
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    const type = asset.type === "video" ? "video" : "image";
    setPicked({
      uri: asset.uri,
      type,
      mimeType: (asset as any).mimeType,
    });
  };

  const uploadAndCreate = async () => {
    if (!picked) return;
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(picked.uri);
      const blob = await res.blob();
      const contentType =
        picked.mimeType ||
        (picked.type === "video" ? "video/mp4" : "image/jpeg");

      const upRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: blob,
      });
      if (!upRes.ok) throw new Error("Upload failed");
      const { storageId } = await upRes.json();
      await createStory({
        storageId,
        mediaType: picked.type,
        caption: caption.trim() ? caption.trim() : undefined,
        isPublic,
      });
      reset();
      onClose();
    } catch (_) {
      setIsUploading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Hekayə əlavə et</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={22} color={Colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={pickMedia}
            activeOpacity={0.9}
            style={styles.pickBtn}
            disabled={isUploading}
          >
            <Camera size={22} color={Colors.foreground} />
            <Text style={styles.pickBtnText}>{mediaLabel}</Text>
          </TouchableOpacity>

          <View style={styles.previewWrap}>
            {picked?.type === "image" ? (
              <Image source={{ uri: picked.uri }} style={styles.preview} contentFit="cover" />
            ) : picked?.type === "video" ? (
              <View style={[styles.preview, styles.videoPreview]}>
                <Text style={styles.videoPreviewText}>Video</Text>
                <Text style={styles.videoPreviewSub}>Preview üçün viewer açılacaq</Text>
              </View>
            ) : (
              <View style={[styles.preview, styles.previewPlaceholder]}>
                <Text style={styles.placeholderText}>Media seçilməyib</Text>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Caption (istəyə görə)</Text>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Bir cümlə yaz..."
              placeholderTextColor={Colors.mutedForeground}
              style={styles.input}
              editable={!isUploading}
              maxLength={120}
            />
          </View>

          <View style={styles.publicRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.publicTitle}>Public</Text>
              <Text style={styles.publicSubtitle}>Hər kəs görsün (match olmadan)</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              disabled={isUploading}
              thumbColor={Platform.OS === "android" ? (isPublic ? Colors.primary : "#999") : undefined}
              trackColor={{ true: Colors.primaryAlpha15, false: "rgba(255,255,255,0.12)" }}
            />
          </View>

          <TouchableOpacity
            style={[styles.createBtn, (!picked || isUploading) && styles.createBtnDisabled]}
            onPress={uploadAndCreate}
            disabled={!picked || isUploading}
            activeOpacity={0.85}
          >
            {isUploading ? (
              <ActivityIndicator color={Colors.foreground} />
            ) : (
              <>
                <Check size={18} color={Colors.foreground} />
                <Text style={styles.createBtnText}>Paylaş</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    paddingBottom: 14,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: Colors.foreground, fontSize: 18, fontWeight: "800" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },

  pickBtn: {
    marginTop: 14,
    marginHorizontal: 16,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  pickBtnText: { color: Colors.foreground, fontSize: 14, fontWeight: "700" },

  previewWrap: { marginTop: 12, marginHorizontal: 16 },
  preview: { width: "100%", height: 200, borderRadius: 18, backgroundColor: Colors.surfaceDark },
  previewPlaceholder: { justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  placeholderText: { color: Colors.mutedForeground, fontSize: 13, fontWeight: "600" },
  videoPreview: { justifyContent: "center", alignItems: "center" },
  videoPreviewText: { color: Colors.foreground, fontSize: 18, fontWeight: "800" },
  videoPreviewSub: { color: Colors.mutedForeground, fontSize: 12, marginTop: 6 },

  field: { marginTop: 12, marginHorizontal: 16 },
  fieldLabel: { color: Colors.mutedForeground, fontSize: 12, fontWeight: "700", marginBottom: 8 },
  input: {
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: Colors.foreground,
    fontSize: 14,
  },
  publicRow: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  publicTitle: { color: Colors.foreground, fontSize: 14, fontWeight: "800" },
  publicSubtitle: { color: Colors.mutedForeground, fontSize: 12, marginTop: 2 },

  createBtn: {
    marginTop: 14,
    marginHorizontal: 16,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createBtnDisabled: { backgroundColor: "rgba(255,255,255,0.10)" },
  createBtnText: { color: Colors.foreground, fontSize: 14, fontWeight: "800" },
});

