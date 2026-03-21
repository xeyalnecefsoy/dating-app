/**
 * Mobile color palette — eyedropped from the actual web app render.
 *
 * globals.css .dark oklch values render in the browser as:
 *   background  oklch(0.08 0.03 265) → #000108
 *   card        oklch(0.12 0.03 265) → #080a1a
 *   border      oklch(0.20 0.04 265) → #141628
 *   primary     accent magenta (web-like) → #e942a2
 *   brandGrad   gradient-brand → #FF4458 → #FD267A
 *   muted-fg    oklch(0.70 0.02 265) → #a1a1aa
 */
export const Colors = {
  background: "#000108",
  card: "#080a1a",
  border: "#141628",
  foreground: "#FAFAFA",
  primary: "#e942a2",
  primaryGradientEnd: "#FD267A",
  brandGradientFrom: "#FF4458",
  brandGradientTo: "#FD267A",
  tabBarActiveTint: "#e942a2",
  secondary: "#141628",
  muted: "#141628",
  mutedForeground: "#a1a1aa",
  green: "#20D5A0",
  gold: "#FFB800",
  premium: "#fbbf24",
  destructive: "#ef4444",

  destructiveLight: "#fda4af",
  infoBlue: "#3b82f6",
  warningOrange: "#f59e0b",
  passOrange: "#f97316",
  likeGreen: "#4ade80",
  modalCard: "#060812",

  cardAlpha: "rgba(8,10,26,0.85)",
  borderAlpha: "rgba(20,22,40,0.6)",
  primaryAlpha10: "rgba(233,66,162,0.10)",
  primaryAlpha15: "rgba(233,66,162,0.15)",
  secondaryAlpha50: "rgba(20,22,40,0.5)",

  surfaceDark: "#141628",
} as const;
