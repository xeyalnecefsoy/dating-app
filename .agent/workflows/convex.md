---
description: Convex database və backend əməliyyatları üçün qaydalar
---

# Convex Workflow

// turbo-all

## 1. Convex Dev Server

```bash
npx convex dev
```

Bu ayrı terminalda işləməlidir, Next.js dev server-dən əlavə.

---

## 2. Schema Dəyişikliyi

`convex/schema.ts` faylında dəyişiklik:

```typescript
// Nümunə: Yeni field əlavə etmək
export const users = defineTable({
  name: v.string(),
  email: v.string(),
  newField: v.optional(v.string()),  // Optional olaraq başla
});
```

Sonra:
```bash
npx convex dev  # Avtomatik migration edir
```

---

## 3. Mutation Yaratmaq

```typescript
// convex/myModule.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutation = mutation({
  args: {
    userId: v.string(),
    data: v.object({
      field1: v.string(),
      field2: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Authenticated user yoxla
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Database əməliyyatı
    const id = await ctx.db.insert("tableName", {
      ...args.data,
      userId: args.userId,
    });

    return id;
  },
});
```

---

## 4. Query Yaratmaq

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tableName")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});
```

---

## 5. Frontend-də İstifadə

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Query
const data = useQuery(api.myModule.myQuery, { userId: "123" });

// Mutation
const myMutation = useMutation(api.myModule.myMutation);
await myMutation({ userId: "123", data: { ... } });
```

---

## 6. Auth Kontekstdə

Convex mutation-larında həmişə auth yoxla:

```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthenticated");
}
```

---

## ⚠️ Ümumi Xətalar

| Xəta | Həll |
|------|------|
| `Unauthenticated call` | Frontend-də `isLoaded` && `isSignedIn` yoxla |
| `Document not found` | ID-nin düzgün olduğunu yoxla |
| `Type error in args` | `v.` validator-larını düzgün istifadə et |

---

*Son yenilənmə: 2026-02-05*
