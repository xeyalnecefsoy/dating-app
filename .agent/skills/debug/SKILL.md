# Debug & Troubleshooting Skill

> Bug aşkarlama, debug etmə və problem həll etmə qaydaları.

## Triggers
Bu skill aşağıdakı sözlər istifadə olunanda aktivləşir:
- bug, xəta, error, problem
- debug, fix, düzəlt, həll et
- çalışmır, işləmir, broken
- console, log, stack trace

---

## 🔍 Debug Prosesi

### 1. Xətanı Anla
```
Suallar:
- Xəta mesajı nədir?
- Hansı faylda baş verir?
- Nə zaman baş verir? (click, load, submit)
- Reproduksiya addımları nədir?
```

### 2. Xəta Tipini Müəyyən Et

| Tip | Əlamətləri | Yoxla |
|-----|-----------|-------|
| **Build Error** | `npm run build` uğursuz | TypeScript errors |
| **Runtime Error** | Konsol xətası | Browser DevTools |
| **Hydration Error** | Mismatch xəbərdarlığı | Server/Client fərqi |
| **API Error** | Network tab-da 4xx/5xx | Convex logs |
| **Auth Error** | Unauthenticated | Clerk session |

---

## 🛠️ Ümumi Xətalar və Həlləri

### Build Errors

#### TypeScript Type Error
```
Error: Type 'X' is not assignable to type 'Y'
```
**Həll:**
```typescript
// Option 1: Düzgün tipi istifadə et
const value: CorrectType = ...

// Option 2: Type assertion (son çarə)
const value = something as ExpectedType

// Option 3: Optional chaining
const value = obj?.property ?? defaultValue
```

#### Module Not Found
```
Error: Cannot find module '@/components/X'
```
**Həll:**
1. Fayl mövcuddurmu yoxla
2. Import path düzgündürmü yoxla
3. `tsconfig.json` paths yoxla

---

### Runtime Errors

#### Hydration Mismatch
```
Warning: Text content did not match
```
**Həll:**
```tsx
// ❌ Problem
{new Date().toLocaleString()}

// ✅ Həll 1: Sabit format
{new Date().toLocaleString('en-US')}

// ✅ Həll 2: useEffect ilə
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

#### useSearchParams Error
```
Error: useSearchParams() should be wrapped in a suspense boundary
```
**Həll:**
```tsx
import { Suspense } from "react";

<Suspense fallback={<Loading />}>
  <ComponentUsingSearchParams />
</Suspense>
```

---

### API/Convex Errors

#### Unauthenticated
```
Error: Unauthenticated call to mutation
```
**Həll:**
```tsx
// Frontend-də auth yoxla
const { isLoaded, isSignedIn } = useAuth();

if (!isLoaded) return <Loading />;
if (!isSignedIn) {
  // Mutation-u çağırma, auth yoxdur
  return <SignInPrompt />;
}

// İndi təhlükəsiz şəkildə mutation çağıra bilərsən
```

#### Document Not Found
```
Error: Document not found
```
**Həll:**
- ID-nin düzgün olduğunu yoxla
- Document silinməyibmi yoxla
- Race condition yoxdurmu yoxla

---

## 🔧 Debug Alətləri

### Browser DevTools
```
Console Tab:
- Xəta mesajları
- console.log() çıxışları

Network Tab:
- API çağırışları
- Response body
- Status codes

React DevTools:
- Component state
- Props
- Context values
```

### Convex Dashboard
```bash
# Lokal logs
npx convex logs

# Dashboard
https://dashboard.convex.dev
```

### Console Logging Pattern
```typescript
// Mutation-da
handler: async (ctx, args) => {
  console.log("Args:", JSON.stringify(args, null, 2));
  
  const result = await ctx.db.query("table").collect();
  console.log("Query result count:", result.length);
  
  // ...
}
```

---

## 📋 Debug Checklist

```
[ ] Xəta mesajını tam oxudum
[ ] Stack trace-ə baxdım
[ ] Konsolu yoxladım
[ ] Network tab-ı yoxladım
[ ] Son dəyişiklikləri nəzərdən keçirdim
[ ] Əlaqəli faylları oxudum
[ ] Minimal reproduksiya ssenarisi yaratdım
```

---

## 💡 Debug Tips

1. **Binary Search** - Kodun yarısını comment edib hansı hissədə problemin olduğunu tap
2. **Console.log liberal** - Şübhəli yerlərdə log qoy
3. **Fresh Start** - `rm -rf .next && npm run dev`
4. **Isolate** - Problemi minimal nümunədə reproduksiya et
5. **Read Error Carefully** - Xəta mesajı çox vaxt həlli göstərir
