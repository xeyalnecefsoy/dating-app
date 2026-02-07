---
description: Development zamanı faydalı məsləhətlər və biliklər
---

# Dev Insights - İnkişaf Məsləhətləri

Layihədə işləyərkən toplanmış təcrübə və biliklər.

---

## 🔧 Tez-tez İstifadə Olunan Snippet-lər

### Convex Query İstifadəsi
```tsx
const data = useQuery(api.users.getUser, 
  userId ? { userId } : "skip"  // Skip if no userId
);
```

### Auth Yoxlama
```tsx
const { isSignedIn, isLoaded } = useAuth();

if (!isLoaded) return <Loading />;
if (!isSignedIn) return <Redirect to="/sign-in" />;
```

### Responsive Class-lar
```tsx
// Mobile-only
className="block sm:hidden"

// Desktop-only
className="hidden sm:block"

// Responsive spacing
className="p-4 sm:p-6 lg:p-8"
```

---

## ⚡ Performans İpucları

1. **Image Optimization**
   ```tsx
   import Image from "next/image"
   <Image src={url} width={200} height={200} alt="..." />
   ```

2. **Lazy Loading**
   ```tsx
   import dynamic from "next/dynamic"
   const HeavyComponent = dynamic(() => import("./Heavy"), {
     loading: () => <Skeleton />
   })
   ```

3. **Memoization**
   ```tsx
   const memoizedValue = useMemo(() => compute(a, b), [a, b]);
   const memoizedCallback = useCallback(() => doSomething(a), [a]);
   ```

---

## 🐛 Debug İpucları

### Convex Debug
```bash
# Konsolda
npx convex logs
```

### React DevTools
1. Browser extension yüklə
2. Components tab-da state yoxla
3. Profiler tab-da performans analiz et

### Network Debug
1. DevTools → Network tab
2. XHR/Fetch filter-lə
3. Request/Response yoxla

---

## 📱 Mobile Test

1. DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
2. iPhone SE, iPhone 12/14 test et
3. Touch gesture-ları yoxla

---

## 🎨 UI/UX Qaydaları

- Minimum touch target: 44x44px
- Loading state həmişə göstər
- Error state-ləri idarə et
- Empty state-lər üçün fallback

---

*Son yenilənmə: 2026-02-05*
