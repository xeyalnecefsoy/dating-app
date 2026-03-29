import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "İcma qaydaları",
  description: "Danyeri icma qaydaları — profil, foto və ünsiyyət standartları.",
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Link>
        </div>
      </header>
      <article className="blog-article prose prose-invert max-w-2xl mx-auto px-4 py-10 rounded-3xl border border-border bg-card/60">
        <h1 className="text-3xl font-bold mb-2">İcma qaydaları</h1>
        <p className="text-muted-foreground lead">
          Danyeri ciddi tanışlıq üçün platformadır. Aşağıdakı qaydalara riayət etmək həm sizin, həm də
          digər üzvlərin təhlükəsiz və hörmətli təcrübəsi üçündür.
        </p>

        <h2>Profil və dil</h2>
        <ul>
          <li>
            <strong>Ad və soyad</strong> hər sözün ilk hərfi böyük olmaqla, Azərbaycan latın əlifbası ilə
            düzgün yazılmalıdır.
          </li>
          <li>
            <strong>Bio (açıqlama)</strong> ən azı bir neçə cümlə olmalı, özünüz, maraqlarınız və niyyətiniz
            haqqında məlumat verməlidir. Tək simvol və ya yalnız durğu işarələri qəbul edilmir.
          </li>
          <li>
            Azərbaycan dilində düzgün ifadə və qarşılıqlı hörmət gözlənilir. təhqir, qısaldılmış təhqiredici
            yazılar və ya təhqiramiz ləqəblər qadağandır.
          </li>
        </ul>

        <h2>Profil şəkli</h2>
        <ul>
          <li>Şəkil sizə məxsus olmalı, üzünüzün tanınması üçün kifayət qədər aydın olmalıdır.</li>
          <li>
            Əsas profil şəkilində <strong>siqaret, elektron siqaret və ya təhqiramiz jestlər</strong>{" "}
            tövsiyə olunmur; ciddi tanışlıq mühitinə uyğun gəlməyən təsvirlər rədd edilə bilər.
          </li>
          <li>
            Zorakılıq, silah, narkotik və ya cinayət təşkilatlarının simvolikasını təbliğ edən şəkillər
            qəbul edilmir.
          </li>
        </ul>

        <h2>Ünsiyyət və təhlükəsizlik</h2>
        <ul>
          <li>Qarşı tərəfə qarşı təhqir, təqib və ya təzyiq qadağandır.</li>
          <li>Spam, reklam və ya üçüncü tərəf platformalarına zorla yönləndirmə qadağandır.</li>
          <li>Şikayət və moderator qərarlarına hörmət göstərilməlidir.</li>
        </ul>

        <p className="text-muted-foreground text-sm mt-8">
          Qaydalar vaxtaşırı yenilənə bilər. Davam etməklə bu şərtləri qəbul etmiş olursunuz.
        </p>

        <p className="mt-6">
          <Link href="/onboarding" className="text-primary font-medium hover:underline">
            Profilə qayıt
          </Link>
        </p>
      </article>
    </div>
  );
}
