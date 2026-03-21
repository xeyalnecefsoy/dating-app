import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import {
  ArrowLeft,
  MapPin,
  Star,
  Percent,
  Copy,
  Check,
  Coffee,
  Utensils,
  Film,
  Gamepad2,
  X,
} from "../lib/icons";
import { Colors } from "../lib/colors";
import { useQuery } from "convex/react";
import { api } from "../lib/api";
import { VENUE_TYPES } from "../lib/partner-venues";

const typeIcons: Record<string, React.ComponentType<any>> = {
  restaurant: Utensils,
  cafe: Coffee,
  cinema: Film,
  entertainment: Gamepad2,
};

export default function VenuesScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const dbVenues = useQuery(api.venues.listVenues);
  const venueData: any[] = dbVenues || [];

  const filteredVenues =
    selectedType === "all"
      ? venueData
      : venueData.filter((v: any) => v.type === selectedType);

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "İlk Görüş Məkanları",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.foreground,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <ArrowLeft size={24} color={Colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Intro */}
        <Text style={s.intro}>Romantik görüşlər üçün xüsusi endirimlər</Text>

        {/* Type Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
          style={{ marginBottom: 20 }}
        >
          {VENUE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[s.filterBtn, selectedType === type.id && s.filterBtnActive]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text
                style={[s.filterBtnText, selectedType === type.id && s.filterBtnTextActive]}
              >
                {type.nameAz}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Venue Cards */}
        {filteredVenues.map((venue) => {
          const TypeIcon = typeIcons[venue.type] || Utensils;
          return (
            <TouchableOpacity
              key={venue._id || venue.id}
              style={s.card}
              activeOpacity={0.9}
              onPress={() => setSelectedVenue(venue)}
            >
              {/* Image */}
              <View style={s.cardImageWrap}>
                <Image source={{ uri: venue.image }} style={s.cardImage} contentFit="cover" />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.6)"]}
                  style={StyleSheet.absoluteFillObject}
                />

                {/* Discount badge */}
                {venue.discount && (
                  <View style={s.discountBadge}>
                    <Percent size={10} color="#fff" />
                    <Text style={s.discountText}>{venue.discount}% OFF</Text>
                  </View>
                )}

                {/* Type badge */}
                <View style={s.typeBadge}>
                  <TypeIcon size={11} color="#fff" />
                  <Text style={s.typeBadgeText}>{venue.typeAz}</Text>
                </View>

                {/* Rating */}
                <View style={s.ratingBadge}>
                  <Star size={11} color="#facc15" fill="#facc15" />
                  <Text style={s.ratingText}>{venue.rating}</Text>
                </View>
              </View>

              {/* Content */}
              <View style={s.cardContent}>
                <View style={s.cardTitleRow}>
                  <Text style={s.cardTitle} numberOfLines={1}>
                    {venue.name}
                  </Text>
                  <Text style={s.priceRange}>
                    {"₼".repeat(venue.priceRange)}
                    <Text style={{ opacity: 0.3 }}>{"₼".repeat(3 - venue.priceRange)}</Text>
                  </Text>
                </View>

                <View style={s.cardAddressRow}>
                  <MapPin size={12} color={Colors.mutedForeground} />
                  <Text style={s.cardAddress} numberOfLines={1}>
                    {venue.address}, {venue.location}
                  </Text>
                </View>

                <Text style={s.cardDesc} numberOfLines={2}>
                  {venue.descriptionAz}
                </Text>

                {venue.specialOfferAz && (
                  <View style={s.specialBanner}>
                    <Text style={s.specialText}>🎁 {venue.specialOfferAz}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedVenue}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedVenue(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            {selectedVenue && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image */}
                <View style={s.modalImageWrap}>
                  <Image
                    source={{ uri: selectedVenue.image }}
                    style={s.modalImage}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={s.modalCloseBtn}
                    onPress={() => setSelectedVenue(null)}
                  >
                    <X size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={s.modalBody}>
                  <Text style={s.modalTitle}>{selectedVenue.name}</Text>

                  {/* Meta row */}
                  <View style={s.modalMeta}>
                    <View style={s.metaItem}>
                      <Star size={14} color="#facc15" fill="#facc15" />
                      <Text style={s.metaText}>{selectedVenue.rating}</Text>
                    </View>
                    <Text style={s.metaText}>
                      {"₼".repeat(selectedVenue.priceRange)}
                    </Text>
                    <Text style={s.metaText}>{selectedVenue.typeAz}</Text>
                  </View>

                  {/* Address */}
                  <View style={s.modalAddressRow}>
                    <MapPin size={14} color={Colors.mutedForeground} />
                    <Text style={s.modalAddressText}>
                      {selectedVenue.address}, {selectedVenue.location}
                    </Text>
                  </View>

                  <Text style={s.modalDesc}>{selectedVenue.descriptionAz}</Text>

                  {/* Discount code */}
                  {selectedVenue.discountCode && (
                    <View style={s.discountCard}>
                      <Text style={s.discountLabel}>Endirim Kodu</Text>
                      <View style={s.discountCodeRow}>
                        <Text style={s.discountCodeText}>
                          {selectedVenue.discountCode}
                        </Text>
                        <TouchableOpacity
                          style={s.copyBtn}
                          onPress={() => copyCode(selectedVenue.discountCode!)}
                        >
                          {copiedCode === selectedVenue.discountCode ? (
                            <>
                              <Check size={14} color={Colors.primary} />
                              <Text style={s.copyBtnText}>Kopyalandı</Text>
                            </>
                          ) : (
                            <>
                              <Copy size={14} color={Colors.primary} />
                              <Text style={s.copyBtnText}>Kopyala</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                      <Text style={s.discountPercent}>
                        {selectedVenue.discount}% endirim
                      </Text>
                    </View>
                  )}

                  {/* Special offer */}
                  {selectedVenue.specialOfferAz && (
                    <View style={s.specialCard}>
                      <Text style={s.specialCardTitle}>🎁 Xüsusi Təklif</Text>
                      <Text style={s.specialCardBody}>
                        {selectedVenue.specialOfferAz}
                      </Text>
                    </View>
                  )}

                  {/* Tags */}
                  <View style={s.tagsRow}>
                    {selectedVenue.tagsAz.map((tag: string) => (
                      <View key={tag} style={s.tag}>
                        <Text style={s.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* CTA */}
                  <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85}>
                    <LinearGradient
                      colors={[Colors.brandGradientFrom, Colors.brandGradientTo]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={s.ctaGradient}
                    >
                      <Text style={s.ctaText}>Rezervasiya Et</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  intro: {
    textAlign: "center",
    color: Colors.mutedForeground,
    fontSize: 14,
    marginBottom: 16,
  },
  filterRow: { gap: 8, paddingRight: 16 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.muted,
  },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterBtnText: { fontSize: 13, fontWeight: "600", color: Colors.mutedForeground },
  filterBtnTextActive: { color: "#fff" },

  // Cards
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardImageWrap: { height: 160, position: "relative" },
  cardImage: { ...StyleSheet.absoluteFillObject },
  discountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  typeBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "500" },
  ratingBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  cardContent: { padding: 14 },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: Colors.foreground, flex: 1 },
  priceRange: { color: Colors.mutedForeground, fontSize: 13, marginLeft: 8 },
  cardAddressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  cardAddress: { color: Colors.mutedForeground, fontSize: 12, flex: 1 },
  cardDesc: { color: Colors.mutedForeground, fontSize: 13, lineHeight: 19, marginBottom: 10 },
  specialBanner: {
    backgroundColor: Colors.primaryAlpha10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  specialText: { color: Colors.primary, fontSize: 12, fontWeight: "600" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalImageWrap: { height: 200, position: "relative" },
  modalImage: { ...StyleSheet.absoluteFillObject },
  modalCloseBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: { padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: Colors.foreground, marginBottom: 8 },
  modalMeta: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: Colors.mutedForeground, fontSize: 13 },
  modalAddressRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  modalAddressText: { color: Colors.mutedForeground, fontSize: 13 },
  modalDesc: { color: Colors.mutedForeground, fontSize: 14, lineHeight: 22, marginBottom: 18 },

  // Discount card
  discountCard: {
    backgroundColor: Colors.primaryAlpha10,
    borderWidth: 1,
    borderColor: Colors.primaryAlpha15,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  discountLabel: { color: Colors.primary, fontSize: 12, fontWeight: "600", marginBottom: 8 },
  discountCodeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discountCodeText: {
    color: Colors.foreground,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
  },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  copyBtnText: { color: Colors.primary, fontSize: 12, fontWeight: "600" },
  discountPercent: { color: Colors.primary, opacity: 0.7, fontSize: 12, marginTop: 6 },

  // Special card
  specialCard: {
    backgroundColor: Colors.muted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  specialCardTitle: { color: Colors.foreground, fontSize: 13, fontWeight: "700", marginBottom: 4 },
  specialCardBody: { color: Colors.mutedForeground, fontSize: 13 },

  // Tags
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  tag: {
    backgroundColor: Colors.muted,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { color: Colors.mutedForeground, fontSize: 12 },

  // CTA
  ctaBtn: { borderRadius: 14, overflow: "hidden", marginBottom: 12 },
  ctaGradient: { paddingVertical: 16, alignItems: "center", borderRadius: 14 },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
