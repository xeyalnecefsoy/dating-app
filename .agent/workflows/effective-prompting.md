---
description: AI modellərinə effektiv tapşırıq vermək qaydaları - bütün modellər üçün universal
---

# Effektiv Prompt Yazmaq

Bu qaydalar istənilən AI modelinin (Gemini, Claude, GPT, və s.) sizin istəklərinizi düzgün başa düşməsinə kömək edir.

---

## 🎯 Əsas Prinsiplər

### 1. Kontekst Ver
```
❌ Yanlış: "Bu komponenti düzəlt"
✅ Düzgün: "UserCard.tsx komponentində profil şəklinin yüklənməsi işləmir. Şəkil Convex storage-dan gəlir, amma render olunmur."
```

### 2. Nəticəni Təsvir Et
```
❌ Yanlış: "Dizaynı yaxşılaşdır"
✅ Düzgün: "Like düyməsini daha cəlbedici et - glassmorphism effekti, hover animasiyası və gradient background istəyirəm"
```

### 3. Addımları Bölüşdür
Böyük tapşırıqları kiçik hissələrə böl:
```
❌ Yanlış: "Bütün auth sistemini yenidən yaz və test et"
✅ Düzgün: 
  1. "Əvvəlcə hazırki auth axınını analiz et"
  2. "Sign-up formunu yenilə"
  3. "Testləri yaz"
```

### 4. Əvvəlki Konteksti Xatırlat
Model konteksti unutduqda:
```
"Əvvəlki söhbətimizdə UserProfile tipinə `createdAt` əlavə etmişdik. 
İndi bu sahəni profil səhifəsində göstər."
```

---

## 📝 Prompt Şablonları

### Bug Həll Etmək
```
Problem: [Problemin qısa təsviri]
Fayl: [Fayl yolu, məs: components/UserCard.tsx]
Gözlənilən davranış: [Nə olmalı idi]
Faktiki davranış: [Nə baş verir]
Xəta mesajı (varsa): [Konsol xətası]
```

### Yeni Xüsusiyyət
```
Xüsusiyyət: [Ad]
Məqsəd: [Nə üçün lazımdır]
Davranış: [Necə işləməlidir]
UI elementi: [Görünüş təsviri - opsional]
Fayl yeri: [Harada yaradılmalı]
```

### Refaktoring
```
Fayl: [Fayl yolu]
Problem: [Hazırki problemlər - performans, oxunaqlılıq və s.]
İstək: [Nəyi necə dəyişmək istəyirəm]
Qorunmalı davranış: [Nəyin dəyişməməli olduğu]
```

---

## ⚠️ Qaçınılmalı Səhvlər

| ❌ Etmə | ✅ Et |
|---------|-------|
| Çox qısa olmaq | Lazımi kontekst ver |
| Çox uzun olmaq | Əsas nöqtələri vurğula |
| Qeyri-müəyyən olmaq | Konkret ol |
| "Düzəlt" demək | Problemin nə olduğunu izah et |
| Birdəfəlik çox şey istəmək | Addımlara böl |
| Nəticəni təsvir etməmək | Gözləntiləri bildir |

---

## 🔄 Model İşləmirsə

1. **Konteksti yenilə** - Əsas faylları göstər
2. **Daha kiçik addım** - Tapşırığı daha da böl
3. **Nümunə ver** - İstədiyini kod nümunəsi ilə göstər
4. **Yeni söhbət** - Bəzən sıfırdan başlamaq daha effektivdir

---

*Son yenilənmə: 2026-02-05*
