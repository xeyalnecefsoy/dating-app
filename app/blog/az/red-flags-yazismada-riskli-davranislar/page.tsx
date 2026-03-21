import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Red flags: yazışmada riskli davranışlar",
  description:
    "Online yazışma zamanı tez-tez rast gəlinən red flag-lər: manipulyasiya, hörmətsizlik, sərhəd tanımamaq və şübhəli davranış nümunələri.",
  alternates: {
    canonical: "https://www.danyeri.az/blog/az/red-flags-yazismada-riskli-davranislar",
  },
  openGraph: {
    title: "Red flags: yazışmada riskli davranışlar",
    description:
      "Mesajlarda hansı davranışlar sizə xəbərdarlıq siqnalı olmalıdır? Real nümunələr və praktiki məsləhətlər.",
    url: "https://www.danyeri.az/blog/az/red-flags-yazismada-riskli-davranislar",
  },
};

export default function RedFlagsAzPage() {
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
              Red flags ● Davranış analizi
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              Red flags: yazışmada riskli davranışlar
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 6 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
              alt="Yazışmada red flag nümunələri"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Yazışmalar münasibətin ilk “pəncərəsidir”. İnsanların necə yazdığı, sizinlə necə
            danışdığı, sərhədlərinizə necə yanaşdığı gələcəkdə necə davranacağını çox vaxt
            öncədən göstərir. Riskli siqnalları – red flag-ləri – vaxtında görmək sizi həm
            emosional, həm də fiziki zərərdən qoruya bilər.
          </p>

          <h2>1. Həddindən artıq tələsdirmə və təzyiq</h2>
          <p>
            “Tez görüşək”, “niyə cavab vermirsən?”, “online-san, amma yazmırsan” kimi təkrar
            mesajlar, qarşı tərəfin sizin sərhədlərinizə hörmət etmədiyini göstərə bilər.
          </p>
          <h3>Red flag nümunələri</h3>
          <ul>
            <li>Qısa tanışlıqdan sonra evlilik, nişan, birgə yaşamaq haqqında çox tez danışmaq.</li>
            <li>Sizin rahat olduğunuz sürəti qəbul etməmək.</li>
            <li>Məsajlara gec cavab verdiyiniz üçün sizi günahlandırmaq.</li>
          </ul>

          <h2>2. Hörmətsiz zarafat və məsxərəyə qoyma</h2>
          <p>
            Əgər zarafat adı altında daim sizi kiçildən, bədəniniz, geyiminiz, danışığınız və
            ailəniz haqqında hörmətsiz ifadələr işlədilirsə, bu ciddi xəbərdarlıq siqnalıdır.
          </p>
          <ul>
            <li>“Zarafat edirəm də, bu qədər ciddiyə alma” cümləsi ilə hər şeyi ört-basdır etməsi.</li>
            <li>Sizi davamlı müdafiə mövqeyinə salan, izah tələb edən lağ-lağılar.</li>
            <li>Kulturoloji və ya dini dəyərlərinizə hörmətsiz yanaşma.</li>
          </ul>

          <h2>3. Məxfilik sərhədlərini pozmaq</h2>
          <p>
            Qısa müddətdə şəxsi foto, video, lokasiya və ya kontaktlarınızı istəmək; “göndər
            də, biz də tanış olaq” kimi cümlələrlə təzyiq göstərmək tipik red flag-dir.
          </p>
          <ul>
            <li>İntim məzmun üçün israr, “əgər mənim üçün nəsə hiss edirsənsə, göndərərsən” tipli manipulyasiya.</li>
            <li>Dostlarınız, ailəniz, əvvəlki münasibətləriniz barədə həddən artıq detallı sorğu.</li>
            <li>Sizin “yox” cavabınızı qəbul etməyib mövzunu təkrar-təkrar açmaq.</li>
          </ul>

          <h2>4. Hekayələrin uyğun gəlməməsi və ziddiyyətlər</h2>
          <p>
            Bir neçə gün və ya həftə ərzində danışdıqları bir-birini təkzib edirsə, eyni mövzu
            haqqında fərqli versiyalar deyirlərsə, bu da diqqətə alınmalı siqnaldır.
          </p>
          <ul>
            <li>İş, ailə, yaşadığı yer haqqında fərqli zamanlarda fərqli məlumatlar verməsi.</li>
            <li>Sual verdikdə əsəbiləşməsi və mövzunu dəyişməsi.</li>
            <li>Hər şeyi “məni çox sorğu-sual etmə” deyib bağlamağa çalışma.</li>
          </ul>

          <h2>5. Qurban roluna girmək və emosional şantaj</h2>
          <p>
            Daim özünü qurban kimi göstərmək, sizin empatiyanızdan sui-istifadə etmək də
            manipulyasiya forması ola bilər. Xüsusilə pul, sığınacaq, təcili yardım istəkləri
            burada çox təhlükəlidir.
          </p>
          <ul>
            <li>“Mənim heç kimim yoxdur, yalnız sən varsən” deyib üzərinizə emosional yük qoymaq.</li>
            <li>Qısa müddətdə maddi yardım istəyi.</li>
            <li>Sırf rədd etməyəsiniz deyə özünə zərər verməklə hədələmək.</li>
          </ul>

          <h2>Nəticə: Narahat olduğunuz yerdə dayanmaq haqqınızdır</h2>
          <p>
            Heç bir mesaj, heç bir “potensial münasibət” sizin təhlükəsizliyinizdən və
            emosional rifahınızdan daha önəmli deyil. İçinizdə “burada nəsə qaydasında deyil”
            hissi varsa, bu hissi ciddiyə almaq və məsafə saxlamaq tamamilə normaldır.
          </p>
        </article>

        <section className="mt-10 md:mt-12 rounded-3xl border border-primary/30 bg-linear-to-br from-primary/10 via-pink-500/10 to-primary/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Daha sağlam tanışlıq mühiti axtarırsınız?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-5 max-w-xl">
            Danyeri-də məqsədimiz, hörmətsiz, aqressiv və təhlükəli davranışlara sıfır
            tolerantlıqla yanaşmaqdır. Qaydalarımızı pozan istifadəçilər platformadan uzaqlaşdırılır
            ki, xüsusilə qadınlar özlərini daha güvəndə hiss etsinlər.
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

