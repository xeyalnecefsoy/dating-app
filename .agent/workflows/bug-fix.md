---
description: Bug aşkarlanması və həll edilməsi prosesi - addım-addım
---

# Bug Həll Etmə Workflow-u

// turbo-all

## 1. Problemi Təsvir Et

Model ilk öncə bunları bilməlidir:
- Hansı fayl/komponentdə problem var
- Gözlənilən davranış nədir
- Faktiki davranış nədir
- Konsol/terminal xətası (varsa)

## 2. Reproduce Et

```bash
npm run dev
```

Brauzerdə problemi nümayiş et.

## 3. Səbəbi Müəyyən Et

Əlaqəli faylları oxu:
- Komponenti özünü
- İstifadə etdiyi hook/context-ləri
- API/mutation fayllarını

## 4. Həll Et

Minimum dəyişikliklə həll yolu tap. Stilinə toxunma, əlavə refaktoring etmə.

## 5. Test Et

```bash
npm run build
```

Build uğurludursa, brauzerdə də yoxla.

## 6. Document Et

`/project-notes` workflow-una əlavə et:
- Problem nə idi
- Həll yolu nə idi
- Gələcəkdə necə qaçınmaq olar

---

## Nümunə Prompt

```
Problem: Discovery səhifəsində "like" düyməsinə basanda "Unauthenticated" xətası çıxır.

Fayl: components/discovery/UserCard.tsx

Gözlənilən: Like mutation işləməli
Faktiki: Konsola "Unauthenticated call to like" yazır

Xəta mesajı:
Error: Unauthenticated call to function mutations:likes:like
```

---

*Son yenilənmə: 2026-02-05*
