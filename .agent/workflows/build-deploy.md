---
description: Build və Vercel deploy prosesi
---

# Build və Deploy Workflow

// turbo-all

## 1. Lokal Build Yoxla

Deploy-dan əvvəl həmişə lokal build et:

```bash
npm run build
```

### Ümumi Build Xətaları

| Xəta | Həll |
|------|------|
| `Type 'X' is not assignable` | TypeScript tip xətası - düzəlt |
| `Module not found` | Import yolunu yoxla |
| `useSearchParams requires Suspense` | Komponenti `<Suspense>` ilə sar |
| `Hydration mismatch` | `toLocaleString('en-US')` istifadə et |

## 2. Git Push

```bash
git add .
git commit -m "feat/fix/style: mesaj"
git push origin main
```

## 3. Vercel Monitorinq

Deploy avtomatik başlayır. Burada yoxla:
- https://vercel.com/dashboard

### Deploy Xətaları

| Xəta | Həll |
|------|------|
| `NEXT_PUBLIC_CONVEX_URL` undefined | Vercel env variables-ə əlavə et |
| `CLERK_SECRET_KEY` missing | Vercel env-ə Clerk keys əlavə et |
| Build timeout | Kodu optimallaşdır |

## 4. Env Variables

Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
CONVEX_DEPLOYMENT=xxx
```

---

## Sürətli Deploy

```bash
npm run build && git add . && git commit -m "message" && git push
```

---

*Son yenilənmə: 2026-02-05*
