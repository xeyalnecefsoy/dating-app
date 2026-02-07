# API & Backend Skill

> Convex database, mutations, queries və server-side logic üçün qaydalar.

## Triggers
Bu skill aşağıdakı sözlər istifadə olunanda aktivləşir:
- API, endpoint, mutation, query
- database, data, schema
- Convex, backend, server
- CRUD, create, read, update, delete
- authentication, auth

---

## 📊 Convex Schema

### Yeni Table Yaratmaq
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  messages: defineTable({
    senderId: v.string(),
    receiverId: v.string(),
    body: v.string(),
    isRead: v.boolean(),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"]),
});
```

---

## 🔄 Mutations

### Standart Mutation Template
```typescript
// convex/[module].ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    data: v.object({
      field1: v.string(),
      field2: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    // 1. Auth yoxla
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // 2. Validation (lazım olarsa)
    if (!args.name.trim()) {
      throw new Error("Name cannot be empty");
    }

    // 3. Database əməliyyatı
    const id = await ctx.db.insert("tableName", {
      ...args.data,
      userId: identity.subject,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("tableName"),
    updates: v.object({
      field1: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Ownership yoxla
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, args.updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    await ctx.db.delete(args.id);
  },
});
```

---

## 📖 Queries

### Standart Query Template
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

// Tək item
export const getById = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Siyahı
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tableName")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Pagination
export const listPaginated = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("tableName")
      .order("desc")
      .paginate({ cursor: args.cursor ?? null, numItems: limit });
  },
});
```

---

## 🔐 Authentication Pattern

```typescript
// Həmişə auth yoxla
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthenticated");
}

// User ID əldə et
const userId = identity.subject; // Clerk user ID

// Token claim-ləri
const email = identity.email;
const name = identity.name;
```

---

## 📱 Frontend İstifadəsi

```tsx
"use client"

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MyComponent() {
  // Query - avtomatik real-time updates
  const data = useQuery(api.module.list, { userId: "123" });
  
  // Skip pattern - şərt ödənməyəndə
  const conditionalData = useQuery(
    api.module.getById,
    userId ? { id: userId } : "skip"
  );

  // Mutation
  const createItem = useMutation(api.module.create);
  
  const handleCreate = async () => {
    try {
      await createItem({ name: "Test", data: { field1: "value" } });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Loading state
  if (data === undefined) {
    return <Loading />;
  }

  return <div>{/* UI */}</div>;
}
```

---

## ⚠️ Ümumi Xətalar

| Xəta | Səbəb | Həll |
|------|-------|------|
| `Unauthenticated` | Frontend-də auth yüklənməyib | `isLoaded && isSignedIn` yoxla |
| `Document not found` | Yanlış ID | ID-nin düzgünlüyünü yoxla |
| `Index not found` | Schema-da index yoxdur | Schema-ya index əlavə et |
| Type error | Validator uyğunsuzluğu | `v.` tipini düzəlt |

---

## 📋 Checklist

Yeni API endpoint yaratarkən:
- [ ] Auth yoxlanılır?
- [ ] Input validation var?
- [ ] Error handling var?
- [ ] Index lazımdırsa schema-da var?
- [ ] Frontend-də loading/error state var?
