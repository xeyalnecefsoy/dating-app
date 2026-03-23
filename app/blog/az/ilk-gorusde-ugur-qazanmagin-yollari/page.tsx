import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/ilk-gorusde-ugur-qazanmagin-yollari";
const TITLE = "İlk görüşdə uğur qazanmağın elmi sübut olunmuş yolları";
const DESC = "Bədən dili, aktiv dinləmə və neyropsixoloji taktikalarla ilk görüşü necə unudulmaz etmək olar? Harvard və digər mütəxəssislərin araşdırmalarından peşəkar məsləhətlər.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: "article",
    images: [{ url: "https://images.unsplash.com/photo-1555529733-0e670560f7e1?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function FirstDateSuccessArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1555529733-0e670560f7e1?w=800&q=80" 
      />
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
              Məsləhətlər ● Araşdırma
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              {TITLE}
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 5 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1555529733-0e670560f7e1?w=800&q=80"
              alt="İlk Görüşdə Uğur Qazanmaq"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Danyeri kimi ciddi platformalarda xoş bir təəssürat yaradıb uzun uzun yazışdıqdan sonra nəhayət o gün gəlib çatır: İlk görüş! İnsanlar arasında "kimyanın" (uyğunluğun) əsl rəngi ilk real görüşdə bəlli olur. Psixologiya isə göstərir ki, ilk təəssürat beynimizin cəmi saniyələr ərzində verdiyi qərarla formalaşır.
          </p>
          <p className="text-base leading-relaxed">
            Şans faktoru bir kənara, psixoloqlar və ünsiyyət ekspertləri (o cümlədən Harvard və Stanford araşdırmaçıları) uğurlu görüşün bəzi "gizli" dinamikalarını kəşf ediblər.
          </p>

          <h2>1. "Aktiv Dinləmə" Möcüzəsi</h2>
          <p>
            Harvard Universitetinin araşdırmalarına görə, ən cəlbedici insanlar çox və maraqlı danışanlar yox, diqqətlə dinləyənlər və doğru "follow-up" (davam) sualları verənlərdir. Qarşı tərəf bir hekayə danışdıqda, sözünü kəsib "ah məndə də belə olmuşdu" demək əvəzinə, "Bu vəziyyətdə özünü necə hiss etdin?" və ya "Bəs bu qərara necə gəldin?" tipli suallar onu təsdiqlənmiş, dəyərli və maraqlı hiss etdirir. Beyin bu pozitiv emosiyanı birbaşa sizinlə əlaqələndirir.
          </p>

          <h2>2. Açıq Bədən Dili və Göz Təması</h2>
          <p>
            Araşdırmalar göstərir ki, ünsiyyətin yalnız 7%-i sözlərə əsaslanır, qalanı isə səs tonu və bədən dilidir. Qollarını sinədə çarpazlamaq beynə şüuraltı olaraq "müdafiə və qapalıyam" siqnalı göndərir. Qollarınızı açın, yüngülcə önə tərəf əyilin və göz təmasını qoruyun (amma baxışlarınızı dikməyin - 50/70 qaydası tətbiq edin: dinləyəndə %70, danışanda %50 göz təması).
          </p>

          <h2>3. Keçmiş Münasibətləri və Neqativi Masada Qoyun</h2>
          <p>
            İlk görüş bir müsahibə və ya dərdləşmə seansı deyil. Keçmiş travmalardan, işdəki yorucu müdirinizdən və ya həyatın haqsızlığından bəhs etmək həmin anın enerjisini dərhal aşağı salır. İlk görüş təcrübəsi yüngül, pozitiv və əyləncəli olmalıdır. Çünki uzun müddətdə insanlar nə danışdığınızı unutsalar da, onlara <strong>özlərini necə hiss etdirdiyinizi</strong> heç vaxt unutmurlar.
          </p>

          <h2>4. İcazə Verin Səssizliklər Də Olsun</h2>
          <p>
            Sükut yarandıqda təşvişə düşüb ard-arda mənasız mövzular açmağa ehtiyac yoxdur. Psixoloqlar vurğulayır ki, birgə paylaşılan səssizlik və anı yaşamaq "daxili inamın" (confidence) göstəricisidir. Rahat bir şəkildə kofenizi için və göz gəzdirib səmimi bir gülümsəmə ilə pauzanı doldurun.
          </p>

          <h2>5. Həddindən Artıq İntim Suallardan Qaçın</h2>
          <p>
            Sorğu-suala çəkən bir polis müstəntiqi kimi davranmaqdan qaçın. Maddi durum, gələcək evlilik planlarının təfərrüatları, ya da dərin travmalar ilk görüş xaricində saxlanılmalıdır. Daha çox hobbilər, xəyallar, səyahətlər və emosional olaraq fərəhləndirici mövzulardan danışmaq görüşün sonunu "növbəti dəfə nə vaxt görüşürük?" sualına bağlayacaq.
          </p>

          <hr className="my-8 border-border" />
          
          <p className="text-sm italic text-muted-foreground">
            Sizinlə eyni ritmdə düşünən, ciddi və stabil həyat yoldaşı namizədini profilinizlə deyil, məhz şəxsi emosional zəkanızla kəşf edirsiniz. <Link href="/tanisliq" className="text-primary hover:underline">Danyeri</Link>-də öz şansınızı sınamağın əsl vaxtıdır.
          </p>
        </article>
      </main>
    </div>
  );
}
