---
description: Yeni komponent yaratmaq üçün standart proses
---

# Yeni Komponent Yaratmaq

// turbo-all

## 1. Təsvir Et

Modeldən bu məlumatları tələb olunur:
- Komponentin adı və məqsədi
- Harada istifadə olunacaq
- Props-lar (varsa)
- Hansı mövcud komponentlərə bənzəyir

## 2. Yer Müəyyən Et

```
components/
├── ui/           # Ümumi UI elementləri (Button, Card, Modal)
├── discovery/    # Discovery səhifəsi komponentləri
├── messages/     # Mesajlaşma komponentləri
├── profile/      # Profil komponentləri
└── shared/       # Paylaşılan komponentlər
```

## 3. Mövcud Stilə Uyğunlaş

Yaxın komponentə bax:
```tsx
// Nümunə: components/ui/Card.tsx stilini istifadə et
import { Card, CardContent, CardHeader } from "@/components/ui/card"
```

## 4. Yarat

```tsx
// components/[folder]/[ComponentName].tsx
"use client"

import { ComponentProps } from "@/types"

interface MyComponentProps {
  // props burada
}

export function MyComponent({ ...props }: MyComponentProps) {
  return (
    <div className="...">
      {/* UI burada */}
    </div>
  )
}
```

## 5. Export Et

```tsx
// components/[folder]/index.ts (varsa)
export { MyComponent } from "./MyComponent"
```

## 6. Test Et

```bash
npm run build
```

---

## Nümunə Prompt

```
Yeni komponent: PremiumBadge

Məqsəd: Premium istifadəçilər üçün badge göstərmək
Yer: components/ui/
Props: size ("sm" | "md" | "lg"), showText (boolean)

UserCard.tsx-dəki VerifiedBadge komponentinə bənzər olsun,
amma qızılı rəngdə və ulduz ikonu ilə.
```

---

*Son yenilənmə: 2026-02-05*
