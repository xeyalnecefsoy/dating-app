/** Gün/ay/il — brauzer `az-AZ` tarix formatının (M03 və s.) səhvlərindən qaçmaq üçün */

export const REPORT_REASON_LABELS_AZ: Record<string, string> = {
  fake: "Saxta profil",
  harassment: "Qısnama / Narahat etmə",
  inappropriate: "Uyğunsuz məzmun",
  spam: "Spam və ya reklam",
  other: "Digər",
};

export function reportReasonLabelAz(reason: string): string {
  const k = (reason || "").toLowerCase();
  return REPORT_REASON_LABELS_AZ[k] ?? reason;
}

/** Tətbiq daxili problem bildirişi kateqoriyaları */
export const APP_FEEDBACK_CATEGORY_LABELS_AZ: Record<string, string> = {
  bug: "Xəta / işləməmə",
  lag: "Gecikmə / donma",
  crash: "Tətbiq bağlanması",
  ui: "Görünüş / düymə problemi",
  other: "Digər",
};

export function appFeedbackCategoryLabelAz(category: string): string {
  const k = (category || "").toLowerCase();
  return APP_FEEDBACK_CATEGORY_LABELS_AZ[k] ?? category;
}

/** Admin bildiriş axını: DB-də köhnə İngilis səbəb kodlarını (məs. 'fake') göstərimdə AZ etiketə çevirir */
export function localizeNotificationBodyForDisplay(body: string): string {
  if (!body || typeof body !== "string") return body;
  let s = body;
  for (const [code, label] of Object.entries(REPORT_REASON_LABELS_AZ)) {
    const esc = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replace(new RegExp(`'${esc}'`, "gi"), `'${label}'`);
    s = s.replace(new RegExp(`"${esc}"`, "gi"), `"${label}"`);
    s = s.replace(new RegExp(`«${esc}»`, "gi"), `«${label}»`);
  }
  return s;
}

/** Admin bildiriş siyahısı üçün defolt müddət pəncərəsi */
export const ADMIN_NOTIFICATIONS_MAX_AGE_DAYS = 30;

export function formatAzDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Tarix + saat (məs. şikayət vaxtı) */
export function formatAzDateTime(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}
