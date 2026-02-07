# Danyeri Dating App - Layihə Konteksti

> Bu fayl AI agentlərinə layihənin strukturunu başa düşməkdə kömək edir.

## 🛠 Tech Stack

| Kateqoriya | Texnologiya |
|------------|-------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | Shadcn/UI + Tailwind CSS |
| Backend | Convex (serverless) |
| Auth | Clerk |
| Storage | Convex Storage |
| Deploy | Vercel |

## 📁 Fayl Strukturu

```
app/                    # Next.js App Router səhifələri
├── layout.tsx          # Root layout (Providers burada)
├── page.tsx            # Landing page
├── discovery/          # Swipe/kəşf səhifəsi
├── messages/           # Mesajlaşma
├── profile/            # Profil səhifəsi
├── admin/              # Admin panel
├── sign-in/            # Clerk login
└── sign-up/            # Clerk register

components/
├── ui/                 # Shadcn/UI komponentləri
├── discovery/          # Discovery xüsusi komponentləri
├── messages/           # Mesaj komponentləri
├── MainLayout.tsx      # Desktop sidebar + Mobile nav
└── Providers.tsx       # Context providers

convex/
├── schema.ts           # Database schema
├── users.ts            # User mutations/queries
├── messages.ts         # Message mutations/queries
├── matches.ts          # Match/like mutations
└── _generated/         # Auto-generated types

lib/
├── mock-users.ts       # Test user datası
└── utils.ts            # Yardımçı funksiyalar
```

## 💻 Əmrlər

```bash
# Development
npm run dev              # Next.js dev server (port 3000)
npx convex dev           # Convex dev (ayrı terminalda)

# Build & Deploy
npm run build            # Production build
git push                 # Vercel auto-deploy

# Git
git add . && git commit -m "message" && git push
```

## 🔧 Konvensiyalar

### Komponent Adlandırma
- PascalCase: `UserCard.tsx`, `MainLayout.tsx`
- Client components: `"use client"` yuxarıda

### Import Sırası
```tsx
// 1. React/Next
import { useState } from "react"
import Link from "next/link"

// 2. UI libraries
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

// 3. Local imports
import { useUser } from "@/contexts/UserContext"
```

### Tailwind Qaydaları
- Responsive: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode: `dark:` prefix-i
- Həmişə `toLocaleString('en-US')` istifadə et (hydration error önləmək üçün)

### Convex Qaydaları
```typescript
// Query/Mutation nümunəsi
export const myQuery = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // ...
  },
});
```

## ⚠️ Yadda Saxla

1. **MainLayout.tsx** istifadə olunur, `ClientLayout.tsx` yox
2. `useSearchParams()` həmişə `<Suspense>` ilə sarılmalıdır
3. Admin səhifələri MainLayout-dan kənarda işləyir
4. Convex URL `.env.local` və Vercel-də konfiqurasiya olunmalıdır

## 🎯 Skills (Avtomatik Aktivləşir)

| Skill | Trigger Sözləri | Məqsəd |
|-------|----------------|--------|
| `ui/` | component, button, style, Tailwind | Frontend patterns |
| `api/` | mutation, query, Convex, database | Backend patterns |
| `debug/` | bug, error, fix, problem | Troubleshooting |
| `auth/` | login, Clerk, authentication | Auth patterns |

> Skills `.agent/skills/` qovluğundadır və kontekstə görə avtomatik oxunur.

## 📚 Əlavə Resurslar

- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [Shadcn/UI](https://ui.shadcn.com)
