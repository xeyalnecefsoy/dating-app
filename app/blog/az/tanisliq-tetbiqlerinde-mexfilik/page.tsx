import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tanışlıq tətbiqlərində məxfilik: nələrə diqqət etməli?",
  description:
    "Tanışlıq tətbiqlərində foto, lokasiya, şəxsi məlumatlar və sosial şəbəkə hesablarını paylaşarkən məxfiliyinizi qorumaq üçün praktiki məsləhətlər.",
  alternates: {
    canonical: "https://www.danyeri.az/blog/az/tanisliq-tetbiqlerinde-mexfilik",
  },
  openGraph: {
    title: "Tanışlıq tətbiqlərində məxfilik: nələrə diqqət etməli?",
    description:
      "Profil məlumatları, foto paylaşımları və mesajlaşma zamanı özünüzü və şəxsi həyatınızı necə qoruyasınız?",
    url: "https://www.danyeri.az/blog/az/tanisliq-tetbiqlerinde-mexfilik",
  },
};

export default function PrivacyAzPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="w-full max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
              Geri
            </Button>
          </Link>
        </div>
      </header>
      <main className="w-full max-w-3xl mx-auto px-4 py-10 md:py-16">
        <article className="blog-article prose prose-invert max-w-none rounded-3xl border border-border bg-card/60 p-5 md:p-8">
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
              Məxfilik ● Təhlükəsizlik
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              Tanışlıq tətbiqlərində məxfilik: nələrə diqqət etməli?
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 5–7 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
              alt="Tanışlıq tətbiqlərində məxfilik"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Tanışlıq tətbiqləri şəxsi həyatınızın ən həssas tərəflərinə toxunur: münasibət
            gözləntiləriniz, emosiyalarınız və gündəlik həyatınız. Buna görə məxfilik bu
            platformalarda xüsusi əhəmiyyət daşıyır. Məqsəd, həm özünüzü ifadə edə biləcəyiniz,
            həm də şəxsi sərhədlərinizi qoruya biləcəyiniz balansı tapmaqdır.
          </p>

          <h2>1. Foto seçimi: nə qədər şəxsi olmalıdır?</h2>
          <p>
            Profil fotolarınız sizi real göstərməlidir, amma eyni zamanda məkan və şəxsi
            məlumatları aşkar etməməlidir. Evinizin içini, iş yerinizi və ya daim getdiyiniz
            konkret məkanı açıq-aydın göstərən fotolardan uzaq durmaq daha təhlükəsizdir.
          </p>
          <h3>Etməyin</h3>
          <ul>
            <li>Ev binanızın girişi və ya maşının nömrə nişanı görünən fotolardan çəkinin.</li>
            <li>Uşaqların olduğu fotoları profil üçün istifadə etməyin.</li>
            <li>Çox intim və ya şəxsi saydığınız fotoları yalnız tam güvəndiyiniz insana, mərhələli şəkildə göndərin — idealda heç göndərməyin.</li>
          </ul>

          <h2>2. Ad, soyad və sosial şəbəkələr</h2>
          <p>
            Tanışlıq tətbiqində adınızı real istifadə etmək normaldır, amma tam soyadınızı və
            bütün sosial şəbəkə bağlantılarınızı birbaşa profilə yazmaq məxfiliyinizi azalda
            bilər. İnsanların sizi Google və ya digər platformalarda həddindən artıq tez tapması
            bəzən xoş olmayan situasiyalara səbəb olur.
          </p>
          <ul>
            <li>Əgər narahat olursunuzsa, ilk mərhələdə yalnız adınızı göstərmək kifayətdir.</li>
            <li>Instagram və digər hesablarınızı yalnız kifayət qədər güvəndiyiniz insanlarla paylaşın.</li>
            <li>İş yerinizi LinkedIn vasitəsilə, yalnız münasibət ciddiləşəndə paylaşmaq daha sağlamdır.</li>
          </ul>

          <h2>3. Lokasiya və hərəkət marşrutunu gizli saxlayın</h2>
          <p>
            “Həmişə bu kafedəyəm”, “hər axşam bu yoldan keçirəm” kimi detalları çox bölüşmək
            bəzi insanlar üçün sui-istifadə imkanı yarada bilər. Sizi izləmək və ya gözləmək
            istəyən biri üçün bu, lazımsız məlumatdır.
          </p>
          <ul>
            <li>Gündəlik rutininizi və dəqiq saatları paylaşmayın.</li>
            <li>“Həmişə” və “daima” sözləri ilə başlayan lokasiya cümlələrini məhdudlaşdırın.</li>
            <li>Görüş yeri barədə yalnız özünüz qərar verin, təzyiq altında hiss etməyin.</li>
          </ul>

          <h2>4. Mesajlarda məxfilik: screenshot və paylaşım riski</h2>
          <p>
            Yazdığınız hər mesaj, nəzəri olaraq screenshot edilə bilər. Bu səbəbdən yazışmalarda
            paylaşmayacağınız mövzularda, formullarda və tonlarda danışmağa çalışın.
          </p>
          <ul>
            <li>Hisslərinizi ifadə edin, amma özünüzü şantaj edilə biləcək vəziyyətə salmayın.</li>
            <li>Bank kartı, kod, parol, SMS doğrulama kimi heç bir məlumatı mesajda paylaşmayın.</li>
            <li>Hüquqi və ya reputasiya baxımından sizi çətin vəziyyətə sala biləcək etiraflardan çəkinin.</li>
          </ul>

          <h2>5. Platformanın öz məxfilik siyasəti nə deyir?</h2>
          <p>
            İstifadə etdiyiniz tətbiqin məxfilik və icma qaydaları, sizin yanında olduğunuz
            tərəfi təmsil edir. Harada məlumat saxlanılır, kimlə paylaşılır, hansı davranışa
            icazə verilir – bütün bunlar əslində təhlükəsizlik səviyyəsini müəyyən edir.
          </p>
          <h3>Danyeri-də</h3>
          <p>
            Danyeri-də məqsədimiz, xüsusilə qadınların özlərini daha rahat və güvəndə hiss
            etməsidir. Şikayət etmək, istifadəçini bloklamaq və qaydanı pozan profillərin
            sistemdən uzaqlaşdırılması üçün ayrıca mexanizmlər üzərində işləmək bu səbəbdəndir.
          </p>
        </article>

        <section className="mt-10 md:mt-12 rounded-3xl border border-primary/30 bg-linear-to-br from-primary/10 via-pink-500/10 to-primary/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Məxfilik sizin üçün prioritetdirsə…
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-5 max-w-xl">
            Danyeri, məlumatlarınızı üçüncü tərəflərlə paylaşmayan, icma qaydaları ilə
            təhlükəsizliyi önə çəkən bir platforma kimi dizayn olunub. Məqsədimiz – qadınların
            daha rahat “yox” deyə bildiyi, hörmətli münasibət mühiti formalaşdırmaqdır.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sign-up">Təhlükəsiz tanışlığı sınamaq üçün qeydiyyat et</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/about">Qaydalarımızla və dəyərlərimizlə tanış ol</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

