# Security & Safety Skill

> Təhlükəsizlik, doğrulama (validation), icazələr (authorization) və məlumat qorunması qaydaları.

## Triggers
Bu skill aşağıdakı sözlər istifadə olunanda aktivləşir:
- security, secure, hack, vulnerability, zəiflik
- auth, authentication, authorization, icazə, rol
- validation, zod, input check
- xss, csrf, injection, idor
- middleware, protection, guard

---

## 🛡️ Backend Security (Convex)

### 1. Authentication Check (Zəruridir!)
Hər mutation və query-də ilk addım olmalıdır.

```typescript
// ✅ Düzgün yanaşma
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthenticated call");
}
const userId = identity.subject;
```

### 2. Authorization (İcazə)
İstifadəçinin bu əməliyyatı etməyə haqqı varmı?

```typescript
// ✅ Edit/Delete əməliyyatlarında mütləq yoxla
const existingItem = await ctx.db.get(args.id);

if (!existingItem) {
    throw new Error("Item not found");
}

// Yalnız yaradan şəxs və ya admin silə bilər
if (existingItem.userId !== userId && !isAdmin(identity)) {
    throw new Error("Unauthorized: You don't own this item");
}
```

### 3. Input Validation
Convex `args` ilə tipləri yoxlayır, amma məntiqi yoxlamalar da lazımdır.

```typescript
// Schema səviyyəsində
args: {
  username: v.string(), // Kifayət deyil, boş ola bilər
},

// Handler daxilində
if (args.username.length < 3) {
  throw new Error("Username must be at least 3 characters");
}
if (!/^[a-zA-Z0-9_]+$/.test(args.username)) {
  throw new Error("Username contains invalid characters");
}
```

---

## 🌐 Frontend Security (Next.js)

### 1. Zod ilə Form Validation
Client-side validation istifadəçi təcrübəsi üçündür, server-side mütləqdir.

```tsx
import { z } from "zod"

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 chars"),
  age: z.number().min(18, "You must be 18+"),
})

// İstifadə
const result = signUpSchema.safeParse(formData);
if (!result.success) {
  // Show errors
}
```

### 2. XSS (Cross-Site Scripting) Qarşısının Alınması
React avtomatik escape edir, amma `dangerouslySetInnerHTML` təhlükəlidir.

```tsx
// ❌ Qaçın:
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Sanitize edin (əgər mütləq lazımdırsa):
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### 3. Həssas Məlumatların Qorunması
- API açarlarını (SECRET_KEY) heç vaxt frontend kodunda yazmayın.
- `.env.local` istifadə edin və yalnız `NEXT_PUBLIC_` prefixi olanları client-a göndərin.

---

## 🔒 Common Vulnerabilities & Fixes

| Zəiflik | Nümunə | Həll |
|---------|--------|------|
| **IDOR** | `/api/users/123` ilə başqasının profilini dəyişmək | Backend-də `userId === currentUserId` yoxla |
| **Injection** | SQL Injection (Convex-də yoxdur, amma məntiq xətaları ola bilər) | Input validation və strict typing |
| **CSRF** | Başqa saytdan sizin adınıza əməliyyat etmək | Next.js server actions və Clerk tokenləri bunu həll edir |
| **Exposure** | `.git` papkasının serverdə qalması | Deploy zamanı təmizləyin |

---

## 📋 Security Checklist

Yeni funksional yazarkən yoxla:

- [ ] İstifadəçi login olubmu? (`ctx.auth.getUserIdentity`)
- [ ] İstifadəçinin bu dataya giriş haqqı varmı? (Ownership check)
- [ ] Giriş parametrləri (args) validasiya edilirmi?
- [ ] Həssas məlumatlar (email, telefon) lazımsız yerə göndərilmir ki?
- [ ] Error mesajları sistem haqqında çox məlumat vermir ki?
