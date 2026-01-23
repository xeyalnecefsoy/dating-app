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

## 🔴 Vercel/Next.js 16 Build Xətaları

### 9. TypeScript 'never' Type Xətası
**Problem:** `selectedConv?.participantId` - TypeScript tipi `never` kimi çıxarır.

**Səbəb:** `if (selectedConv) { return ... }` bloku var, TypeScript düşünür ki, sonrakı kodda `selectedConv` heç vaxt `Conversation` ola bilməz.

**Həll:** Tip casting istifadə et:
```tsx
// ❌ Xəta verir
isSelected={selectedConv?.participantId === matchId}

// ✅ Düzgün
isSelected={(selectedConv as Conversation | null)?.participantId === matchId}
```

---

### 10. useSearchParams Suspense Xətası (Next.js 16)
**Problem:** `useSearchParams() should be wrapped in a suspense boundary`

**Həll 1 - Komponenti Suspense ilə sar:**
```tsx
import { Suspense } from "react";

<Suspense fallback={null}>
  <NotificationHandler />
</Suspense>
```

**Həll 2 - loading.tsx yarat:**
```tsx
// app/messages/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

---

### 11. ThemeContext toggleTheme Əksik
**Problem:** `Property 'toggleTheme' does not exist on type 'ThemeProviderState'`

**Həll:** `contexts/ThemeContext.tsx`-ə əlavə et:
```tsx
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;  // ← Əlavə et
};

// Implementation
const toggleTheme = () => {
  const newTheme = theme === "dark" ? "light" : "dark";
  setTheme(newTheme);
};
```

---

### 12. UserProfile Əksik Sahələr
**Problem:** `DebugUserSwitcher.tsx`-də tip xətası - əksik properties.

**Həll:** `UserProfile` tipindəki bütün sahələri doldur:
```tsx
const newUser: UserProfile = {
  // ... mövcud sahələr ...
  messageRequests: [],        // ← Əlavə et
  sentMessageRequests: [],    // ← Əlavə et
  seenMessageRequests: [],    // ← Əlavə et
};
```

**Qayda:** `UserContext.tsx`-dəki `UserProfile` tipini yoxla və bütün sahələri əlavə et.

---

### 13. Convex URL Əksik (Vercel Build)
**Problem:** `Error: No address provided to ConvexReactClient`

**Səbəb:** Vercel-də `NEXT_PUBLIC_CONVEX_URL` environment variable təyin olunmayıb.

**Həll 1 - Vercel-ə env əlavə et:**
```
Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_CONVEX_URL = https://your-deployment.convex.cloud
```

**Həll 2 - Kodu resilient et:**
```tsx
// components/ConvexClientProvider.tsx
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function ConvexClientProvider({ children }) {
  if (!convex) {
    console.warn("Convex URL not configured. Running without Convex.");
    return <>{children}</>;
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

---

## 📋 Gələcək İşlər (TODO)

- [x] ~~Messages - `participantId` lint xətasını həll et~~ ✅
- [x] ~~Convex build xətasını həll et~~ ✅
- [x] ~~PWA konfiqurasiyası~~ ✅
- [x] ~~Mesaj istəkləri (Message Requests)~~ ✅
- [ ] Admin Panel - Real Convex data ilə inteqrasiya
- [ ] Push Notifications - Backend server qurulması
- [ ] UserProfile tipinə `joined`/`createdAt` əlavə et
- [ ] Vercel-ə NEXT_PUBLIC_CONVEX_URL əlavə et

---

## 🔍 Debug İpucları

1. **Layout işləmirsə:** `MainLayout.tsx` yoxla, `ClientLayout.tsx` deyil
2. **Sidebar gizlənmirsə:** `pathname?.includes()` istifadə et
3. **Hydration xətası:** `toLocaleString('en-US')` istifadə et
4. **z-index problemi:** Admin panel `z-50`, toggle `z-[60]`
5. **Hot reload işləmirsə:** Brauzeri manual refresh et
6. **Vercel build uğursuz:** Lokal `npm run build` ilə test et
7. **TypeScript 'never' xətası:** Tip casting `as Type | null` istifadə et
8. **useSearchParams xətası:** `Suspense` ilə sar və ya `loading.tsx` yarat
9. **Convex xətası:** `NEXT_PUBLIC_CONVEX_URL` env yoxla və ya ConvexProvider-ı conditional et
10. **Convex funksiya tapılmır:** `npx convex dev` işə salıb funksiyaları deploy et

---

## 🔑 Environment Variables

| Dəyişən | Məqsəd | Harada |
|---------|--------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex backend URL | `.env.local` + Vercel |
| `CONVEX_DEPLOYMENT` | Convex deployment ID | `.env.local` |

**Vercel-ə əlavə etmək:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Production, Preview, Development üçün əlavə et

---

## 📱 PWA Konfiqurasiyası

### Lazımi Fayllar:
```
public/
├── manifest.json        # App manifestu
├── sw.js                # Service Worker
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

### Komponentlər:
- `components/ServiceWorkerRegister.tsx` - SW qeydiyyatı
- `components/PWAInstallPrompt.tsx` - Yükləmə təklifi (Android + iOS)

### Layout Meta Tags:
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Danyeri",
  },
};
```

---

## 💬 Mesaj İstəkləri Sistemi

### Convex Funksiyaları:
```typescript
// convex/matches.ts
sendRequest     // İstək göndər
getRequests     // Gələn istəkləri al
acceptRequest   // İstəyi qəbul et
declineRequest  // İstəyi rədd et
```

### UserProfile Sahələri:
```typescript
messageRequests: string[]       // Gələn istəklər
sentMessageRequests: string[]   // Göndərilmiş istəklər
seenMessageRequests: string[]   // Görülmüş istəklər
```

### Real-time Dinləmə:
```tsx
const convexRequests = useQuery(api.matches.getRequests, 
  user ? { userId: user.id } : "skip"
);
```

---

## 🆔 Unikal İstifadəçi ID-ləri

### Problem:
Əvvəl bütün istifadəçilər `"current-user"` ID-sinə malik idi, bu da peer-to-peer bildirişləri qeyri-mümkün edirdi.

### Həll:
```tsx
// Onboarding zamanı
const id = profile.id || `user-${Math.random().toString(36).substr(2, 9)}`;
```

### Test İpucu:
Mock user adı (Tural, Lalə və s.) ilə qeydiyyatdan keçsən, avtomatik olaraq həmin mock user-ın ID-si verilir:
```tsx
const mockUser = MOCK_USERS.find(u => u.name.toLowerCase() === formData.name.toLowerCase());
const userId = mockUser ? mockUser.id : undefined;
```

---

## 📐 Responsive Dizayn İpucları

### Kiçik Ekranda Kart Overlay Azaltma:
```tsx
// Qradient daha yüngül
className="bg-gradient-to-t from-black/90 via-black/20 to-transparent"

// Responsive font ölçüsü
className="text-2xl sm:text-3xl"

// Mobile-da gizlət, desktop-da göstər
className="hidden sm:flex"

// Mobile-only göstər
className="flex sm:hidden"
```

### Sabit Hündürlük (Layout Shift önləmək):
```tsx
// Tövsiyə banneri - sabit hündürlük
className="h-[52px] flex items-center justify-center"

// Mətn kəsmə
className="line-clamp-2"
```

---

## 🖱️ Kliklənən Sahələr

### Kartda Profilə Keçid:
```tsx
<Link
  href={`/user/${profile.id}`}
  onClick={(e) => e.stopPropagation()}  // Drag-ı önlə
  className="block active:opacity-80"
>
  <h2>{profile.name}</h2>
  <span className="underline">Profilə bax</span>
</Link>
```

**Qayda:** Swipe kartlarında Link istifadə edərkən `e.stopPropagation()` əlavə et, yoxsa swipe ilə toqquşur.

---

## 🔔 Bildiriş İkonu Qaydası

**Problem:** Mobil header-da ürək ikonu bildirişlər üçün istifadə olunurdu, istifadəçilər başa düşmürdü.

**Həll:** Həm desktop (sidebar) həm mobile-da **Bell** ikonu istifadə et:
```tsx
<Bell className="w-5 h-5" />  // Heart yox
```

---

## 🔐 Clerk Authentication Sistemi

### Quraşdırma:
```bash
npm install @clerk/nextjs
```

### Lazımi Fayllar:
| Fayl | Məqsəd |
|------|--------|
| `middleware.ts` | Route qorunması (public vs protected) |
| `convex/auth.config.ts` | Convex JWT doğrulaması |
| `app/sign-in/[[...sign-in]]/page.tsx` | Giriş səhifəsi |
| `app/sign-up/[[...sign-up]]/page.tsx` | Qeydiyyat səhifəsi |
| `components/auth/AuthGuard.tsx` | Auth yoxlama komponenti |
| `components/auth/UserMenu.tsx` | İstifadəçi profil düyməsi |

### Environment Variables:
```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discovery
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Clerk Dashboard Quraşdırması:
1. https://dashboard.clerk.com → "Create Application"
2. "Email" və "Google" authentication metodlarını aktivləşdir
3. API Keys → Publishable key və Secret key kopyala
4. JWT Templates → Convex üçün template yarat (optional)

### Convex ilə İnteqrasiya:
```tsx
// components/ConvexClientProvider.tsx
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

<ClerkProvider>
  <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
    {children}
  </ConvexProviderWithClerk>
</ClerkProvider>
```

### UserContext ilə Əlaqə:
- Clerk user ID localStorage key-i kimi istifadə olunur
- `danyeri-user-{clerkId}` formatında saxlanılır
- Eyni cihazda fərqli Clerk hesabları fərqli profillər saxlayır

### Azərbaycan Lokallaşdırması:
```tsx
const azLocalization = {
  socialButtonsBlockButton: "{{provider}} ilə davam et",
  dividerText: "və ya",
  formFieldLabel__emailAddress: "E-poçt ünvanı",
  formFieldLabel__password: "Şifrə",
  // ...
};

<ClerkProvider localization={azLocalization}>
```

### Protected Routes:
```tsx
// middleware.ts
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Digər bütün routes qorunur
```

### Debug:
1. **401 xətası:** API keys-i yoxla
2. **Redirect loop:** Public routes-u yoxla
3. **User görünmür:** ClerkProvider-ın layout-da olduğunu yoxla
4. **Convex auth xətası:** JWT template konfiqurasiyasını yoxla

---

*Son yenilənmə: 2026-01-23*
