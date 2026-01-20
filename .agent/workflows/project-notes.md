---
description: Danyeri Dating App - Layihə Qeydləri və Öyrənilən Dərslər
---

# Danyeri Dating App - Layihə Qeydləri

Bu fayl layihədə işləyərkən öyrənilən vacib məqamları, həll yollarını və nümunələri saxlayır.

---

## 📁 Layihə Strukturu

### Layout Sistemi
- **Ana Layout:** `app/layout.tsx` → `MainLayout` komponentini istifadə edir
- **MainLayout:** `components/MainLayout.tsx` - Desktop sidebar + Mobile bottom nav
- **ClientLayout:** `components/ClientLayout.tsx` - **İSTİFADƏ OLUNMUR** (köhnə, toxunma)
- **Admin Layout:** `app/admin/page.tsx` - Öz daxili layoutu var

### Vacib Fayllar
| Fayl | Məqsəd |
|------|--------|
| `components/MainLayout.tsx` | Əsas app layout (sidebar, bottom nav) |
| `components/Navigation.tsx` | SideNav, BottomNav komponentləri |
| `components/Providers.tsx` | Context providers, NotificationHandler |
| `lib/mock-users.ts` | Mock user datası (UserProfile tipi) |
| `convex/messages.ts` | Mesaj mutations (send, edit, delete) |
| `public/sw.js` | Service Worker (offline, notifications) |

---

## 🔧 Tez-tez Qarşılaşılan Problemlər və Həllər

### 1. Admin Panel + App Sidebar Toqquşması
**Problem:** Admin səhifəsində həm app sidebar, həm admin sidebar görünür.

**Həll:** `MainLayout.tsx` faylında admin səhifələrini istisna et:
```tsx
const isAdminPage = pathname?.includes("/admin");

if (isAuthPage || isAdminPage) {
  return <>{children}</>;
}
```

**Vacib:** `ClientLayout.tsx` deyil, `MainLayout.tsx` istifadə olunur!

---

### 2. Hydration Xətası (toLocaleString)
**Problem:** Server və client fərqli nəticə verir → hydration mismatch.

**Həll:** Həmişə locale təyin et:
```tsx
// ❌ Yanlış
{value.toLocaleString()}

// ✅ Düzgün
{value.toLocaleString('en-US')}
```

---

### 3. UserProfile Tip Xətaları
**Problem:** `user.verified`, `user.premium`, `user.joined` mövcud deyil.

**Həll:** `lib/mock-users.ts`-dəki düzgün sahə adlarını istifadə et:
- `verified` → `isVerified`
- `premium` → `isPremium`
- `joined` → mövcud deyil (statik string istifadə et)

---

### 4. Responsive Sidebar (Admin Panel)
**Struktur:**
```tsx
// Mobile overlay
{isSidebarOpen && (
  <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={close} />
)}

// Sidebar
<aside className={`
  fixed lg:static inset-y-0 left-0 z-50
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  ${isCollapsed ? "lg:w-20" : "lg:w-64"}
  w-64
`}>

// Main content
<main className="flex-1 flex flex-col h-screen overflow-hidden">
```

---

### 5. Sidebar Toggle Düyməsi
**Yaxşı İşləyən Stil:**
```tsx
<Button 
  variant="outline" 
  size="icon" 
  className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-border bg-background shadow-md z-[60] p-0 items-center justify-center hover:bg-accent"
>
```
- `bg-background` - şəffaf olmasın
- `p-0 items-center justify-center` - ikon mərkəzləşsin
- `z-[60]` - digər elementlərin üstündə olsun

---

### 6. Message Edit/Delete Xüsusiyyəti
**Convex Mutation Nümunəsi:**
```typescript
export const editMessage = mutation({
  args: { id: v.id("messages"), userId: v.string(), newBody: v.string() },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    
    // Ownership check
    if (message.userId !== args.userId) {
      throw new Error("You can only edit your own messages");
    }

    // Time limit (15 min)
    const EDIT_LIMIT_MS = 15 * 60 * 1000;
    if (Date.now() - message._creationTime > EDIT_LIMIT_MS) {
      throw new Error("Message is too old to edit");
    }

    await ctx.db.patch(args.id, { body: args.newBody });
  },
});
```

---

### 7. Story Reply Formatı
**Mesajda Story URL saxlama:**
```tsx
// Göndərərkən
const messageBody = storyUrl ? `[STORY:${storyUrl}]${text}` : text;

// Render edərkən
const storyMatch = body.match(/\[STORY:(.*?)\]/);
const storyUrl = storyMatch?.[1];
const cleanText = body.replace(/\[STORY:.*?\]/, '').trim();
```

---

### 8. Browser Notifications
**Əsas Axın:**
```tsx
// İcazə istə
const permission = await Notification.requestPermission();

// Notification göstər
if (permission === 'granted') {
  new Notification(title, {
    body: message,
    icon: '/icon-192x192.png',
    tag: uniqueId, // Dublikatları önlə
  });
}
```

---

## 🎨 UI/UX Qaydaları

### İkonlar
- **Lucide React** istifadə et, emoji yox
- Import: `import { IconName } from "lucide-react"`

### Responsive Grid
```tsx
// Təsdiq kartları üçün
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"

// Düymələr üçün
className="flex flex-col sm:flex-row gap-2"
```

### Button Ölçüləri
- Kiçik: `size="sm"` + `h-8 w-8`
- Orta: `size="icon"` + `h-10 w-10`
- Toggle: `h-8 w-8` optimal

---

## 🚀 Dev Server

```bash
# Başlat
npm run dev

# Port
http://localhost:3000

# Admin Panel
http://localhost:3000/admin
```

---

## 📋 Gələcək İşlər (TODO)

- [ ] Admin Panel - Real Convex data ilə inteqrasiya
- [ ] Push Notifications - Backend server qurulması
- [ ] Messages - `participantId` lint xətasını həll et
- [ ] UserProfile tipinə `joined`/`createdAt` əlavə et

---

## 🔍 Debug İpucları

1. **Layout işləmirsə:** `MainLayout.tsx` yoxla, `ClientLayout.tsx` deyil
2. **Sidebar gizlənmirsə:** `pathname?.includes()` istifadə et
3. **Hydration xətası:** `toLocaleString('en-US')` istifadə et
4. **z-index problemi:** Admin panel `z-50`, toggle `z-[60]`
5. **Hot reload işləmirsə:** Brauzeri manual refresh et

---

*Son yenilənmə: 2026-01-20*
