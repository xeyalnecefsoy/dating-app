import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image as RNImage, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useAction, useQuery } from "convex/react";

import { api } from "../lib/api";
import { Colors } from "../lib/colors";
import { scenarios, type Scenario, type AnalysisResult, analyzeMessage } from "../lib/simulator-data";
import { useAuth } from "@clerk/clerk-expo";
import { ArrowLeft, Sparkles, ChevronRight, Send, User } from "../lib/icons";

const WEB_URL =
  Constants.expoConfig?.extra?.webAppUrl ||
  process.env.EXPO_PUBLIC_WEB_APP_URL ||
  "https://danyeri.vercel.app";

type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
  analysis?: AnalysisResult;
};

function getToneLabel(tone: AnalysisResult["tone"], lang: "az" | "en") {
  if (lang === "en") return tone;

  switch (tone) {
    case "Friendly":
      return "Dostcasına";
    case "Assertive":
      return "İddialı";
    case "Shy":
      return "Utancaq";
    case "Neutral":
      return "Neytral";
    case "Aggressive":
      return "Aqressiv";
  }
}

function ToneBadge({ tone, lang }: { tone: AnalysisResult["tone"]; lang: "az" | "en" }) {
  const label = getToneLabel(tone, lang);

  let bg: string = Colors.primaryAlpha15;
  let border: string = Colors.primaryAlpha10;
  let textColor = Colors.foreground;

  if (tone === "Friendly") {
    bg = "rgba(74,222,128,0.12)";
    border = "rgba(74,222,128,0.20)";
  } else if (tone === "Assertive") {
    bg = "rgba(59,130,246,0.12)";
    border = "rgba(59,130,246,0.20)";
  } else if (tone === "Shy") {
    bg = "rgba(245,158,11,0.12)";
    border = "rgba(245,158,11,0.20)";
  } else if (tone === "Neutral") {
    bg = "rgba(255,255,255,0.03)";
    border = "rgba(255,255,255,0.06)";
  } else if (tone === "Aggressive") {
    bg = "rgba(239,68,68,0.12)";
    border = "rgba(239,68,68,0.20)";
  }

  return (
    <View style={[styles.toneBadge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.toneBadgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function AvatarCircle({
  uri,
  name,
  size,
  variant,
}: {
  uri?: string;
  name: string;
  size: number;
  variant: "card" | "header";
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const avatarUri = uri ? `${WEB_URL}${uri}` : undefined;

  const backgroundColor = variant === "card" ? Colors.primaryAlpha15 : Colors.card;
  const borderColor = variant === "card" ? Colors.primaryAlpha10 : Colors.border;
  const initialsColor = variant === "card" ? Colors.primary : Colors.foreground;

  return (
    <View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2, backgroundColor, borderColor }]}>
      {!avatarUri || failed ? (
        <Text style={[styles.avatarInitials, { fontSize: Math.max(11, size * 0.28), color: initialsColor }]}>{initials}</Text>
      ) : (
        <RNImage
          source={{ uri: avatarUri }}
          style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

function TypingDots() {
  return (
    <View style={styles.dotsRow} accessibilityLabel="AI typing">
      <View style={[styles.dot, styles.dot1]} />
      <View style={[styles.dot, styles.dot2]} />
      <View style={[styles.dot, styles.dot3]} />
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressOuter}>
      <View style={[styles.progressInner, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );
}

export default function SimulatorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { width: windowWidth } = useWindowDimensions();

  // Minimal language parity. Web uses localStorage; we default az for now.
  const lang = "az" as const;

  const dbUser = useQuery(api.users.getUser, userId ? { clerkId: userId } : "skip") as any;

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Per user message analysis accordion state
  const [analysisExpandedById, setAnalysisExpandedById] = useState<Record<string, boolean>>({});
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTone, setCurrentTone] = useState<AnalysisResult["tone"]>("Neutral");

  const scrollRef = useRef<ScrollView | null>(null);

  const contentWidth = Math.max(0, windowWidth - 24); // messagesContent has paddingHorizontal=12
  const analysisWidth = Math.max(200, Math.min(contentWidth * 0.85, 340));

  const filteredScenarios = useMemo(() => {
    const gender = dbUser?.gender as "male" | "female" | undefined;
    if (!gender) return scenarios;
    const targetGender = gender === "male" ? "female" : "male";
    const opposite = scenarios.filter((s) => s.persona.gender === targetGender);
    return opposite.length > 0 ? opposite : scenarios;
  }, [dbUser?.gender]);

  // Reset chat when scenario changes
  useEffect(() => {
    if (!selectedScenario) return;
    setMessages([
      {
        id: "init",
        sender: "ai",
        text: selectedScenario.initialMessage[lang],
      },
    ]);
    setAnalysisExpandedById({});
    setInputValue("");
    setIsTyping(false);
    setCurrentTone("Neutral");
  }, [selectedScenario?.id]);

  const showSuggestions = useMemo(() => {
    const last = messages[messages.length - 1];
    return !!last && last.sender === "ai" && !isTyping && !!selectedScenario;
  }, [messages, isTyping, selectedScenario]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  // Height changes when analysis accordion toggles.
  // Keep scroll anchored to the bottom so next UI doesn't look “cut off”.
  useEffect(() => {
    if (!selectedScenario) return;
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [analysisExpandedById]);

  const chatWithDeepSeek = useAction((api as any).ai.chatWithDeepSeek);

  const handleExitToList = () => {
    setSelectedScenario(null);
    setMessages([]);
    setAnalysisExpandedById({});
    setInputValue("");
    setIsTyping(false);
    setCurrentTone("Neutral");
    // Keep same route, but remove any potential state from navigation stack.
    router.replace("/(tabs)/simulator" as any);
  };

  const handleSend = async () => {
    if (!selectedScenario) return;
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMsgId = Date.now().toString();

    setInputValue("");
    setIsTyping(true);

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: userText,
    };

    const history = [...messages, userMsg].map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);

    const scenarioContext = `
Persona: ${selectedScenario.persona.name}
Role: ${selectedScenario.persona.role[lang]}
Scenario Title: ${selectedScenario.title[lang]}
Scenario Description: ${selectedScenario.description[lang]}
Initial Message: ${selectedScenario.initialMessage[lang]}
`;

    try {
      const result: any = await chatWithDeepSeek({
        userMessage: userText,
        history,
        scenarioContext,
        language: lang,
      } as any);

      const responseText = typeof result?.response === "string" ? result.response : String(result?.response ?? "");
      const analysis: AnalysisResult | undefined = result?.analysis;

      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === userMsgId ? { ...m, analysis } : m));
        return [
          ...updated,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: responseText,
          },
        ];
      });

      if (analysis?.tone) setCurrentTone(analysis.tone);
    } catch (e) {
      const fallbackAnalysis = analyzeMessage(userText, lang);
      const fallbackText = lang === "az" ? "Bağışlayın, hazırda cavab verə bilmirəm." : "Sorry, I'm having trouble responding right now.";

      setCurrentTone(fallbackAnalysis.tone);

      // Ensure the user's message also has analysis in the error state
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === userMsgId ? { ...m, analysis: fallbackAnalysis } : m));
        return [
          ...updated,
          { id: (Date.now() + 1).toString(), sender: "ai", text: fallbackText },
        ];
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (dbUser === undefined && selectedScenario === null) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      {!selectedScenario ? (
        <View style={styles.selectorScreen}>
          <View style={styles.selectorHeader}>
            <Text style={styles.selectorTitle}>Məşq üçün Ssenari Seçin</Text>
            <Text style={styles.selectorSubtitle}>
              Realistik situasiyalarda ünsiyyət bacarıqlarınızı artırın.
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.selectorList} keyboardShouldPersistTaps="handled">
            {filteredScenarios.map((sc) => (
              <Pressable
                key={sc.id}
                style={styles.scenarioCard}
                onPress={() => setSelectedScenario(sc)}
              >
                <View style={styles.scenarioCardHeader}>
                  <AvatarCircle uri={sc.persona.avatar} name={sc.persona.name} size={44} variant="card" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scenarioTitle}>{sc.title[lang]}</Text>
                    <Text style={styles.scenarioDesc} numberOfLines={2}>
                      {sc.description[lang]}
                    </Text>
                  </View>
                </View>

                <View style={styles.scenarioFooter}>
                  <Text style={styles.scenarioFooterText}>Məşqə Başla</Text>
                  <ChevronRight size={16} color={Colors.primary} />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : (
        <>
          <View style={styles.chatHeader}>
            <Pressable onPress={handleExitToList} style={styles.headerIcon} accessibilityLabel="Geri">
              <ArrowLeft size={22} color={Colors.foreground} />
            </Pressable>

            <View style={styles.personRow}>
              <AvatarCircle uri={selectedScenario.persona.avatar} name={selectedScenario.persona.name} size={40} variant="header" />
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>{selectedScenario.persona.name}</Text>
                <Text style={styles.personRole} numberOfLines={1}>
                  {selectedScenario.persona.role[lang]}
                </Text>
              </View>
            </View>

            <Pressable onPress={handleExitToList} style={styles.backTextBtn}>
              <Text style={styles.backText}>Siyahıya Qayıt</Text>
            </Pressable>
          </View>

          <ScrollView
            ref={(r) => {
              scrollRef.current = r;
            }}
            style={styles.messagesArea}
            contentContainerStyle={[
              styles.messagesContent,
              // Keep enough space for the fixed input area.
              // Without this, expanding/collapsing analysis can cause content to be covered.
              { paddingBottom: 220 + insets.bottom },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <View key={m.id} style={[styles.msgRow, isUser && styles.msgRowUser]}>
                  {!isUser ? null : <View style={{ width: 8 }} />}

                  <View style={[styles.bubbleStack, isUser && styles.bubbleStackUser]}>
                    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                      {m.text ? (
                        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAi]}>
                          {m.text}
                        </Text>
                      ) : null}
                    </View>

                    {isUser && m.analysis ? (
                      (() => {
                        const expanded = analysisExpandedById[m.id] ?? true;
                        const shortFeedback = (() => {
                          const full = m.analysis?.feedback?.[lang] ?? "";
                          if (full.length <= 120) return full;
                          return `${full.slice(0, 120)}...`;
                        })();

                        return (
                          <View style={[styles.analysisAccordion, { width: analysisWidth }]}>
                            <Pressable
                              onPress={() =>
                                setAnalysisExpandedById((prev) => ({
                                  ...prev,
                                  [m.id]: !(prev[m.id] ?? true),
                                }))
                              }
                              style={styles.analysisToggleRow}
                            >
                              <Text style={styles.analysisToggleText}>Ox</Text>
                              <View
                                style={[
                                  styles.analysisToggleChevron,
                                  { transform: [{ rotate: expanded ? "270deg" : "90deg" }] },
                                ]}
                              >
                                <ChevronRight size={18} color={Colors.primary} />
                              </View>
                            </Pressable>

                            {expanded ? (
                              <View style={styles.analysisCard}>
                                <View style={styles.analysisTop}>
                                  <View style={styles.analysisTopLeft}>
                                    <Sparkles size={14} color={Colors.primary} />
                                    <Text style={styles.analysisLabel}>AI Analiz</Text>
                                  </View>
                                  <ToneBadge tone={m.analysis.tone} lang={lang} />
                                </View>

                                <Text style={styles.analysisFeedback}>{m.analysis.feedback[lang]}</Text>

                                <View style={styles.statsGrid}>
                                  <View style={styles.statCol}>
                                    <Text style={styles.statLabelText}>Empatiya</Text>
                                    <Text style={styles.statValueText}>{m.analysis.empathy}%</Text>
                                    <ProgressBar value={m.analysis.empathy} />
                                  </View>
                                  <View style={styles.statCol}>
                                    <Text style={styles.statLabelText}>Aydınlıq</Text>
                                    <Text style={styles.statValueText}>{m.analysis.clarity}%</Text>
                                    <ProgressBar value={m.analysis.clarity} />
                                  </View>
                                  <View style={styles.statCol}>
                                    <Text style={styles.statLabelText}>İnam</Text>
                                    <Text style={styles.statValueText}>{m.analysis.confidence}%</Text>
                                    <ProgressBar value={m.analysis.confidence} />
                                  </View>
                                </View>
                              </View>
                            ) : (
                              <View style={styles.analysisCollapsedCard}>
                                <View style={styles.analysisCollapsedTop}>
                                  <ToneBadge tone={m.analysis.tone} lang={lang} />
                                </View>
                                <Text style={styles.analysisCollapsedFeedback}>{shortFeedback}</Text>
                              </View>
                            )}
                          </View>
                        );
                      })()
                    ) : null}
                  </View>
                </View>
              );
            })}

            {isTyping ? (
              <View style={styles.typingRow}>
                <AvatarCircle uri={selectedScenario.persona.avatar} name={selectedScenario.persona.name} size={32} variant="header" />
                <View style={styles.typingBubble}>
                  <TypingDots />
                </View>
              </View>
            ) : null}

            {showSuggestions ? (
              <View style={styles.suggestionsWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsContent}>
                  {selectedScenario.suggestions[lang].map((s, idx) => (
                    <Pressable
                      key={idx}
                      style={styles.suggestionChip}
                      onPress={() => setInputValue(s)}
                    >
                      <Text style={styles.suggestionChipText}>{s}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.inputArea, { marginBottom: insets.bottom }]}>
            <View style={styles.inputTopRow}>
              <View style={styles.inputTopLeft}>
                <Text style={styles.inputToneLabel}>Tonunuz:</Text>
                <ToneBadge tone={currentTone} lang={lang} />
              </View>
              {inputValue.length > 0 ? <Text style={styles.analyzingText}>Analiz edilir...</Text> : null}
            </View>

            <View style={styles.inputRelative}>
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Cavabınızı yazın..."
                placeholderTextColor={Colors.mutedForeground}
                style={styles.input}
                multiline
              />

              <Pressable
                onPress={handleSend}
                style={[styles.sendBtn, (!inputValue.trim() || isTyping) && styles.sendBtnDisabled]}
                disabled={!inputValue.trim() || isTyping}
                accessibilityLabel="Göndər"
              >
                <Send size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },

  selectorScreen: { flex: 1 },
  selectorHeader: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  selectorTitle: { color: Colors.foreground, fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  selectorSubtitle: { color: Colors.mutedForeground, fontSize: 13, textAlign: "center", lineHeight: 18 },
  selectorList: { paddingHorizontal: 16, paddingBottom: 30, gap: 12 },

  scenarioCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
  },
  scenarioCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  scenarioTitle: { color: Colors.foreground, fontSize: 16, fontWeight: "800", marginBottom: 4 },
  scenarioDesc: { color: Colors.mutedForeground, fontSize: 13, lineHeight: 18 },
  scenarioFooter: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scenarioFooterText: { color: Colors.primary, fontSize: 13, fontWeight: "800" },

  chatHeader: {
    height: 72,
    paddingHorizontal: 12,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  personRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarCircle: { borderWidth: 1, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { fontWeight: "800" },
  personName: { color: Colors.foreground, fontSize: 15, fontWeight: "700" },
  personRole: { color: Colors.mutedForeground, fontSize: 12, marginTop: 2 },
  backTextBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  backText: { color: Colors.mutedForeground, fontSize: 12, fontWeight: "700" },

  messagesArea: { flex: 1 },
  messagesContent: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 18, gap: 10 },
  msgRow: { flexDirection: "row", justifyContent: "flex-start" },
  msgRowUser: { justifyContent: "flex-end" },
  bubbleStack: { flexDirection: "column", alignItems: "flex-start" },
  bubbleStackUser: { alignItems: "flex-end" },
  bubble: { maxWidth: "85%", padding: 10, borderRadius: 16, borderWidth: 1 },
  bubbleUser: { backgroundColor: Colors.primary, borderColor: "transparent" },
  bubbleAi: { backgroundColor: Colors.card, borderColor: Colors.border },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: "#fff" },
  bubbleTextAi: { color: Colors.foreground },

  analysisCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.primaryAlpha10,
    borderWidth: 1,
    borderColor: Colors.primaryAlpha15,
  },
  analysisTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  analysisTopLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  analysisLabel: { color: Colors.primary, fontSize: 13, fontWeight: "800" },
  analysisFeedback: { color: Colors.foreground, marginTop: 8, fontSize: 13, lineHeight: 20 },
  statsGrid: { marginTop: 10, flexDirection: "row", gap: 12 },
  statCol: { flex: 1 },
  statLabelText: { color: Colors.mutedForeground, fontSize: 12, fontWeight: "700" },
  statValueText: { color: Colors.foreground, fontSize: 14, fontWeight: "900", marginTop: 3 },
  progressOuter: { height: 5, backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 999, overflow: "hidden", marginTop: 6 },
  progressInner: { height: 4, backgroundColor: Colors.primary, borderRadius: 999 },

  dotsRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.mutedForeground },
  dot1: { opacity: 0.5 },
  dot2: { opacity: 0.85 },
  dot3: { opacity: 0.65 },
  typingRow: { paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  typingBubble: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18 },

  suggestionsWrap: { marginTop: 12 },
  suggestionsContent: { paddingHorizontal: 4, gap: 10, paddingVertical: 6 },
  suggestionChip: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  suggestionChipText: { color: Colors.foreground, fontSize: 13, fontWeight: "700" },

  inputArea: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  inputTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  inputTopLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputToneLabel: { color: Colors.mutedForeground, fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },
  toneBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  toneBadgeText: { fontSize: 11, fontWeight: "900" },

  analyzingText: { color: Colors.mutedForeground, fontSize: 11, fontWeight: "700" },
  inputRelative: { marginTop: 8, position: "relative" as any },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 52,
    color: Colors.foreground,
    backgroundColor: Colors.card,
    fontSize: 14,
  },
  sendBtn: {
    position: "absolute",
    right: 4,
    bottom: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },

  // Analysis accordion
  analysisAccordion: { marginTop: 8, alignSelf: "flex-end" },
  analysisToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  analysisToggleText: { color: Colors.primary, fontSize: 13, fontWeight: "900" },
  analysisToggleChevron: { transform: [{ rotate: "0deg" }] },
  analysisToggleChevronExpanded: { transform: [{ rotate: "90deg" }] },
  analysisCollapsedCard: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.primaryAlpha10,
    borderWidth: 1,
    borderColor: Colors.primaryAlpha15,
  },
  analysisCollapsedTop: { flexDirection: "row", justifyContent: "flex-start" },
  analysisCollapsedFeedback: { color: Colors.foreground, fontSize: 13, lineHeight: 18, marginTop: 6 },
});

