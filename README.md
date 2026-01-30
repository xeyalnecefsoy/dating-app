# Danyeri: Azərbaycanda Modern Tanışlıq və Evlilik Tətbiqi 🇦🇿❤️

> **Həyat yoldaşınızı tapmaq üçün etibarlı, məxfi və dəyərlərə əsaslanan platforma.**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://danyeri.az)
[![Convex](https://img.shields.io/badge/Backend-Convex-FF4155?style=for-the-badge&logo=convex)](https://convex.dev)
[![Next.js](https://img.shields.io/badge/Framework-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

![Danyeri App Preview](/public/og-image.jpg)

## 🌟 Layihə Haqqında

**Danyeri** (əvvəlki adı "Aura Connect"), Azərbaycan cəmiyyətinin xüsusiyyətlərini, mədəni dəyərlərini və müasir texnologiyanın imkanlarını birləşdirən tanışlıq tətbiqidir. Məqsədimiz sadəcə görüş deyil, ciddi münasibət və evlilik üçün doğru insanları bir araya gətirməkdir.

### ✨ Əsas Xüsusiyyətlər

*   **🔒 Təhlükəsizlik və Məxfilik:** AI dəstəkli profil yoxlaması, screenshot bloklama (gələcək plan), və yalnız real istifadəçilər.
*   **⚖️ Balanslı Mühit (Waitlist):** Gender balansını qorumaq üçün bəylər növbə sistemi ilə qəbul edilir. Xanımlar üçün giriş sərbəstdir.
*   **🤖 AI Foto Verification:** Yüklənən şəkillərin keyfiyyətini və insan üzü olub-olmadığını real-time yoxlayır.
*   **💬 Modern Çat:** Mesajlaşma, səsli mesajlar (planlaşdırılır), "Icebreaker" sualları və məkan dəvətləri.
*   **👀 Stories:** Instagram stili hekayələr paylaşma və cavab vermə imkanı.
*   **🇦🇿 Tam Lokallaşdırma:** Azərbaycan dilində interfeys, bölgələr (Bakı, Gəncə, Sumqayıt...) və mədəni nüanslar.

---

## 🛠️ Texnoloji Stack

Layihə ən müasir veb texnologiyaları üzərində qurulub:

*   **Frontend:** [Next.js 15 (App Router)](https://nextjs.org) - Sürətli və SEO dostu.
*   **Backend & Database:** [Convex](https://convex.dev) - Real-time verilənlər bazası və serverless funksiyalar.
*   **Authentication:** [Clerk](https://clerk.com) - Təhlükəsiz giriş sistemi (Google, Email).
*   **Styling:** [Tailwind CSS](https://tailwindcss.com) + [Shadcn UI](https://ui.shadcn.com).
*   **AI/ML:** `face-api.js` (Client-side üz tanıma).
*   **Animations:** Framer Motion.
*   **Deploy:** Vercel.

---

## 🚀 İşə Salma (Local Development)

Kodu yerli kompüterinizdə işlətmək üçün aşağıdakı addımları izləyin:

### 1. Repositoriyanı klonlayın
```bash
git clone https://github.com/SizinUsername/danyeri-app.git
cd dating-app
```

### 2. Asılılıqları yükləyin
```bash
npm install
# və ya
yarn install
```

### 3. Mühit Dəyişənlərini (Environment Variables) Tənzimləyin
`.env.local` faylı yaradın və aşağıdakı açarları əlavə edin (Clerk və Convex dashboard-dan əldə edin):

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-convex-project-name
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 4. Convex Backend-i işə salın
Ayrı bir terminalda:
```bash
npx convex dev
```

### 5. Frontend-i başladın
```bash
npm run dev
```

Tətbiq `http://localhost:3000` ünvanında işləyəcək.

---

## 📱 PWA (Progressive Web App)
Danyeri **PWA** olaraq qurulub. Mobil telefonlarda brauzerdən "Ana Ekranına Əlavə Et" (Add to Home Screen) edərək tətbiq kimi işlədə bilərsiniz.

---

## 🤝 Töhfə Vermək (Contributing)
Töhfələrinizi məmnuniyyətlə qəbul edirik! Xahiş edirik, dəyişiklik etməzdən əvvəl yeni bir `branch` yaradın və `Pull Request` göndərin.

---

## 📄 Lisenziya
Bu layihə [MIT License](LICENSE) altında qorunur.

---

**Müəllif:** [KhayalTurkic](https://github.com/KhayalTurkic)  
**Əlaqə:** support@danyeri.az
