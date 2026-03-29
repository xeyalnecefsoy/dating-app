/**
 * Pretty URLs for /messages: prefer ?u=<username>, fall back to ?userId=<clerkId>.
 * Söhbətgah: ?u=general (username "general" is reserved in Convex).
 */

export type MessagesChatPartner = {
  clerkId: string;
  username?: string | null;
};

export function messagesGeneralHref(): string {
  return "/messages?u=general";
}

export function messagesChatHref(partner: MessagesChatPartner): string {
  const id = partner.clerkId;
  if (!id) return "/messages";
  if (partner.username) {
    return `/messages?u=${encodeURIComponent(partner.username)}`;
  }
  return `/messages?userId=${encodeURIComponent(id)}`;
}

/** Embedded chat (hide bottom nav, etc.) — any of our chat query keys */
export function isMessagesChatOpen(params: {
  get: (key: string) => string | null;
}): boolean {
  return !!(
    params.get("u") ||
    params.get("userId") ||
    params.get("chat")
  );
}
