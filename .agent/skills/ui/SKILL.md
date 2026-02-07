# UI Development Skill

> React, Next.js, Tailwind CSS və Shadcn/UI üçün frontend inkişaf qaydaları.

## Triggers
Bu skill aşağıdakı sözlər istifadə olunanda aktivləşir:
- component, komponent, page, səhifə
- button, düymə, form, modal, card
- React, Tailwind, CSS, style, stil
- responsive, mobile, desktop
- animation, hover, dark mode

---

## 🎨 Dizayn Prinsipləri

### 1. Rəng Paleti
```css
/* Primary - Gradient */
--primary: linear-gradient(135deg, #ec4899 0%, #f97316 100%);

/* Background */
--background-light: #ffffff;
--background-dark: #0a0a0a;

/* Text */
--foreground-light: #171717;
--foreground-dark: #ededed;
```

### 2. Spacing Sistemi
```
4px  = p-1, m-1
8px  = p-2, m-2
16px = p-4, m-4
24px = p-6, m-6
32px = p-8, m-8
```

### 3. Border Radius
```
rounded-md  = 6px   (düymələr, inputlar)
rounded-lg  = 8px   (kartlar)
rounded-xl  = 12px  (böyük kartlar)
rounded-2xl = 16px  (modal)
rounded-full        (avatar, badge)
```

---

## 📱 Responsive Qaydaları

```tsx
// Mobile-first approach
className="w-full sm:w-auto"

// Breakpoints
// sm: 640px+ (tablet)
// md: 768px+ (small laptop)
// lg: 1024px+ (desktop)
// xl: 1280px+ (large desktop)

// Gizlət/Göstər
className="hidden sm:block"  // Desktop only
className="block sm:hidden"  // Mobile only

// Grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
```

---

## 🧩 Komponent Patterns

### Button
```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Card
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Form Input
```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="email@example.com"
    className="w-full"
  />
</div>
```

---

## 🌙 Dark Mode

```tsx
// Həmişə dark: variant istifadə et
className="bg-white dark:bg-zinc-900"
className="text-black dark:text-white"
className="border-gray-200 dark:border-zinc-700"

// Gradient - hər iki moda uyğun
className="bg-gradient-to-r from-pink-500 to-orange-500"
```

---

## ✨ Animasiyalar

```tsx
// Hover
className="hover:scale-105 transition-transform duration-200"

// Opacity
className="hover:opacity-80 transition-opacity"

// Background
className="hover:bg-accent transition-colors"

// Combined
className="transform hover:scale-105 hover:shadow-lg transition-all duration-300"
```

---

## ⚠️ Qaçınılmalılar

| ❌ Etmə | ✅ Et |
|---------|-------|
| Inline styles | Tailwind classes |
| `px` units | Tailwind spacing (p-4, m-2) |
| Custom colors | Design system colors |
| Fixed widths | Responsive widths |
| `!important` | Proper specificity |

---

## 📋 Checklist

Yeni UI komponent yaratarkən:
- [ ] "use client" əlavə edilib?
- [ ] TypeScript interface var?
- [ ] Dark mode dəstəklənir?
- [ ] Mobile responsive?
- [ ] Hover/focus states var?
- [ ] Loading state var?
- [ ] Error state var?
