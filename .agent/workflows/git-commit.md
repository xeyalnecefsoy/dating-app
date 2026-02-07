---
description: Git commit və push prosesi
---

# Git Commit Workflow

// turbo-all

## 1. Dəyişiklikləri Yoxla

```bash
git status
```

## 2. Stage Et

```bash
# Bütün dəyişikliklər
git add .

# Yalnız müəyyən fayllar
git add path/to/file.tsx
```

## 3. Commit Et

Conventional Commits formatında:
```bash
git commit -m "type(scope): mesaj"
```

### Commit Tipləri

| Tip | İstifadə |
|-----|----------|
| `feat` | Yeni xüsusiyyət |
| `fix` | Bug düzəlişi |
| `style` | Görünüş dəyişikliyi |
| `refactor` | Kod refaktoring |
| `docs` | Dokumentasiya |
| `chore` | Build, config və s. |

### Nümunələr

```bash
git commit -m "feat(discovery): add swipe animation"
git commit -m "fix(auth): resolve login redirect loop"
git commit -m "style(profile): improve avatar border radius"
git commit -m "refactor(messages): extract chat logic to hook"
```

## 4. Push Et

```bash
git push origin main
```

## 5. Vercel Deploy

Push-dan sonra Vercel avtomatik deploy edir. Status:
- https://vercel.com/[username]/[project]

---

## Sürətli Push

Bütün addımlar bir yerdə:
```bash
git add . && git commit -m "message" && git push
```

---

*Son yenilənmə: 2026-02-05*
