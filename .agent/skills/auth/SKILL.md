# Authentication Skill

> Clerk authentication və authorization üçün qaydalar.

## Triggers
Bu skill aşağıdakı sözlər istifadə olunanda aktivləşir:
- auth, authentication, login, logout
- sign in, sign up, register
- Clerk, user, session
- protected, middleware, guard

---

## 🔐 Clerk Setup

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discovery
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

---

## 🛡️ Middleware

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

---

## 👤 Frontend İstifadəsi

### Auth Hooks
```tsx
"use client"

import { useAuth, useUser, useClerk } from "@clerk/nextjs";

export function MyComponent() {
  // Auth state
  const { isLoaded, isSignedIn, userId } = useAuth();
  
  // User details
  const { user } = useUser();
  
  // Clerk actions
  const { signOut, openSignIn } = useClerk();

  // Loading state - həmişə yoxla!
  if (!isLoaded) {
    return <Loading />;
  }

  // Auth check
  if (!isSignedIn) {
    return <Button onClick={() => openSignIn()}>Sign In</Button>;
  }

  return (
    <div>
      <p>Welcome, {user?.firstName}</p>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}
```

### UserButton
```tsx
import { UserButton } from "@clerk/nextjs";

<UserButton 
  afterSignOutUrl="/"
  appearance={{
    elements: {
      avatarBox: "h-10 w-10"
    }
  }}
/>
```

---

## 🔄 Convex ilə İnteqrasiya

### ConvexProviderWithClerk
```tsx
// components/ConvexClientProvider.tsx
"use client";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export function ConvexClientProvider({ children }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### Convex-də Auth Yoxlama
```typescript
// convex/myModule.ts
export const protectedMutation = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Clerk User ID
    const clerkId = identity.subject;
    
    // Email, name və s.
    const email = identity.email;
    const name = identity.name;

    // ...
  },
});
```

---

## 📱 Sign In/Up Pages

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            card: "shadow-lg"
          }
        }}
      />
    </div>
  );
}
```

---

## ⚠️ Ümumi Xətalar

| Xəta | Səbəb | Həll |
|------|-------|------|
| Redirect loop | Public routes düzgün deyil | middleware.ts yoxla |
| 401 Unauthorized | Keys yanlış | .env.local yoxla |
| User undefined | Auth yüklənməyib | `isLoaded` yoxla |
| Convex unauthenticated | Token ötürülmür | ConvexProviderWithClerk istifadə et |

---

## 📋 Checklist

Auth implementasiya edərkən:
- [ ] Environment variables quraşdırılıb?
- [ ] middleware.ts public routes düzgündür?
- [ ] ConvexProviderWithClerk istifadə olunur?
- [ ] `isLoaded` həmişə yoxlanılır?
- [ ] Sign-in/sign-up səhifələri var?
