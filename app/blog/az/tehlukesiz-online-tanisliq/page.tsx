import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Azərbaycanda təhlükəsiz online tanışlıq necə olmalıdır?",
  description:
    "Azərbaycanda online tanışlıq edərkən profil, foto, mesajlaşma və ilk görüş mərhələlərində təhlükəsiz qalmaq üçün praktiki məsləhətlər və qaydalar.",
  alternates: {
    canonical: "https://www.danyeri.az/blog/az/tehlukesiz-online-tanisliq",
  },
  openGraph: {
    title: "Azərbaycanda təhlükəsiz online tanışlıq necə olmalıdır?",
    description:
      "Profilinizi necə qura bilərsiniz, kimlərlə yazışmalı, kimlərlə məsafə saxlamalısınız? Təhlükəsiz online tanışlıq üçün əsas qaydalar.",
    url: "https://www.danyeri.az/blog/az/tehlukesiz-online-tanisliq",
  },
};

export default function SafeOnlineDatingAzPage() {
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
              Təhlükəsizlik ● Online tanışlıq
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              Azərbaycanda təhlükəsiz online tanışlıq necə olmalıdır?
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 6–8 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80"
              alt="Azərbaycanda təhlükəsiz online tanışlıq"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Online tanışlıq düzgün istifadə edildikdə çox rahat və təhlükəsiz ola bilər. Ancaq
            xüsusilə qadınlar üçün bəzi risklər mövcuddur və bu risklərin fərqində olmaq vacibdir.
            Bu yazıda təhlükəsiz online tanışlıq üçün praktiki qaydalara və Azərbaycandakı
            reallıqlara uyğun nümunələrə baxacağıq.
          </p>

          <h2>1. Profilinizi təhlükəsiz və real qurun</h2>
          <p>
            Profiliniz həm sizi real şəkildə əks etdirməli, həm də məxfiliyinizi qorumalıdır.
            Ailəvi foto, iş yerinin dəqiq adı, küçə ünvanı kimi detalları profilə yazmaqdan
            çəkinin. Özünüzü tanıdan, amma həyati təhlükə yarada biləcək informasiyanı açmayan
            bir balans qurun.
          </p>
          <ul>
            <li>Şəxsi telefon nömrənizi profil bölmələrinə yazmayın.</li>
            <li>İş yeri ünvanını dəqiq göstərməkdənsə, ümumi “IT sahəsi”, “təhsil sektoru” kimi yazın.</li>
            <li>Heç vaxt kiməsə sənəd, pasport, şəxsiyyət vəsiqəsi fotosu göndərməyin.</li>
          </ul>

          <h2>2. Mesajlaşmaya sakit və nəzarətli başlayın</h2>
          <p>
            İlk mesajlardan etibarən qarşı tərəfin üslubu, hörmət səviyyəsi və sərhədlərə yanaşması
            haqda çox şey oxumaq mümkündür. Sual verə bilməyiniz, sərhəd qoymağınız normaldır.
          </p>
          <ul>
            <li>Ədəbli, aydın cavablar verən və sizi dinləyən insanlara üstünlük verin.</li>
            <li>
              Tələsdirən, “tez nömrəni ver”, “indi görüşə çıxaq” deyən və sərhədlərinizə hörmət
              etməyən insanlara qarşı diqqətli olun.
            </li>
            <li>
              Şəxsi mövzulara (məs. intim, pul, ailə problemləri) çox tez girən biri təhlükə siqnalı ola bilər.
            </li>
          </ul>

          <h2>3. Şəxsi məlumat paylaşımını mərhələli edin</h2>
          <p>
            Tanışlığın ilk həftələrində hər şeyi bölüşmək məcburiyyətində deyilsiniz. Məxfilik sizin
            haqqınızdır. Nəyi, nə vaxt, kimə deyəcəyinizə siz qərar verirsiniz.
          </p>
          <ul>
            <li>Real soyadınızı, dəqiq iş yerinizi və ailə məlumatlarınızı tədricən paylaşın.</li>
            <li>İlk mərhələdə yalnız tətbiq daxilində yazışmaq kifayət edir.</li>
            <li>
              Sosial şəbəkə hesablarınızı paylaşmazdan əvvəl həmin şəxslə özünüzü kifayət qədər
              rahat hiss edib-etmədiyinizi düşünün.
            </li>
          </ul>

          <h2>4. Şübhəli davranışları vaxtında tanıyın</h2>
          <p>
            Təhlükəsiz tanışlıq üçün ən önəmli bacarıqlardan biri də şübhəli siqnalları
            (red flag-ləri) vaxtında görməkdir. Əgər qarşınızdakı insan sizə özünüzü narahat
            hiss etdirirsə, bu hissi ciddiyə alın.
          </p>
          <h3>Diqqət edin</h3>
          <ul>
            <li>Daim mövzuya nəzarət etmək, sizi idarə etməyə çalışmaq.</li>
            <li>Qısa müddətdə “aşiq olduğunu” deyib emosional təzyiq yaratmaq.</li>
            <li>Sizə günahkarlıq hissi aşılamaq və qərarlarınıza hörmətsizlik.</li>
          </ul>

          <h2>5. İlk görüşə keçid: təhlükəsizlik prioritetdir</h2>
          <p>
            Online tanışlıqdan offline görüşə keçmək böyük addımdır. Bu addımı yalnız özünüzü
            kifayət qədər güvəndə hiss etdikdə atın və hər zaman öz təhlükəsizliyinizi əsas yerə
            qoyun.
          </p>
          <h3>Üç əsas qayda</h3>
          <ol>
            <li>İlk görüş üçün hər zaman ictimai, insanların sıx olduğu məkanı seçin.</li>
            <li>Görüş vaxtı və yerini ən azı bir yaxınınıza bildirin.</li>
            <li>Ev ünvanınızı ilk görüşlərdə heç vaxt paylaşmayın.</li>
          </ol>

          <h2>Nəticə: Güvən hissi sizdən başlayır</h2>
          <p>
            Təhlükəsiz online tanışlıq, həm istifadə etdiyiniz platformadan, həm də öz şəxsi
            qərarlarınızdan asılıdır. Hər “yox” demək istədiyiniz yerdə bunu rahatlıqla deyə
            bilməyiniz sizin hüququnuzdur. Sərhədlərinizə hörmət edən insan, gələcək münasibət
            üçün də daha etibarlı namizəddir.
          </p>
        </article>

        <section className="mt-10 md:mt-12 rounded-3xl border border-primary/30 bg-linear-to-br from-primary/10 via-pink-500/10 to-primary/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Təhlükəsiz tanışlığı sınamaq istəyirsiniz?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-5 max-w-xl">
            Danyeri, ciddi münasibət və evlilik niyyəti olan insanlar üçün, təhlükəsiz və
            məxfi mühitdə tanışlıq imkanı yaradır. Qaydalarımız və dəyərlərimiz online
            tanışlığı daha təhlükəsiz etməyə yönəlib.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sign-up">Təhlükəsiz tanışlığı sınamaq üçün qeydiyyat et</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/about">Qaydalarımızla və missiyamızla tanış ol</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

