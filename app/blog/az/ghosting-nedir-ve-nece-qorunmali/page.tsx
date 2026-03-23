import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/ghosting-nedir-ve-nece-qorunmali";
const TITLE = "Ghosting nədir və bu zərərli trenddən necə qorunmaq olar?";
const DESC = "Günlərlə əla davam edən söhbətdən sonra qarşı tərəfin anidən yoxa çıxması (Ghosting) psixologiyası. Bu travmadan necə qurtulmalı və əvvəlcədən necə hiss etməli?";

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
    images: [{ url: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function GhostingArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?w=800&q=80" 
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
              Red flags ● Məsləhətlər
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
              src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?w=800&q=80"
              alt="Ghosting Psixologiyası"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Hər şey çox yaxşı gedirdi. Hər gün yazışırdınız, gecə yarılarına qədər zənglərdə söhbət edir və gələcəklə bağlı üstüörtülü olsa da müsbət fikirlər bölüşürdünüz. Və bir gün - heç bir izahat və xəbərdarlıq olmadan qarşı tərəf yoxa çıxır. Mesajları oxumur, zənglərə cavab vermir. Rəqəmsal dövrün bu qəddar trendinin bir adı var: <strong>Ghosting ("Ruh tək yoxa çıxmaq")</strong>.
          </p>

          <h2>Niyə insanlar "Ghosting" edir?</h2>
          <p>
            Əksəriyyət düşünür ki, o, qəfildən marağını itirdi və ya başqasını tapdı. Bəli, bu bir ehtimaldır. Lakin psixoloqlar əsas səbəbin "Qorxaqlıq və Empatiya əksikliyi" olduğunu iddia edirlər. İnsanlar qarşıdurmadan (confrontation) və pis xəbər verib qarşı tərəfin reaksiyası ilə üzləşməkdən o qədər ürkürlər ki, məsuliyyət götürmədən səssizcə qaçmağa üstünlük verirlər.
          </p>

          <h2>Ghosting Qurbanında Nələr Baş Verir?</h2>
          <p>
            Ghosting adi bir ayrılıqdan qat-qat daha böyük psixoloji iz buraxır. Çünki adi ayrılıqda bir "səbəb" olur və beyin "Niyə?" sualını qapada bilir. Ghostingdə isə səbəb bilinmədiyinə görə travma yaranır. Qurban davamlı olaraq günahı özündə axtarır: <em>"Görəsən yanlış nəsə dedim? Şəklimi bəyənmədi? Mən kifayət qədər yaxşı deyiləm?"</em>
          </p>

          <h2>Ghosting "Potensialını" Əvvəlcədən Necə Hiss Etmək Olar?</h2>
          <ul>
            <li><strong>Səthi müzakirələr:</strong> Çox danışsalar da, şəxsi emosional dərinliklərə, dəyərlərə aid söhbətlərdən daim yayınırlar.</li>
            <li><strong>Praktiki heç nə yoxdur:</strong> "Səninlə filan yerə getməliyik", "o filmi birlikdə izləyərik" deyirlər, amma heç vaxt real olaraq görüş planı və konkret tarix təyin etmirlər.</li>
            <li><strong>Qeyri-stabil temp:</strong> Bəzən sizə aşırı diqqət göstərib 2 saat içində rəfiqəniz/dostunuz qədər yaxınlaşırlar, ardınca isə səbəbsizcə 2 günlük fasilə verirlər.</li>
          </ul>

          <h2>Bununla Necə Başa Çıxmalı?</h2>
          <p>
            1. <strong>Özünüzü qınamayın:</strong> Ghosting edən insanın hərəkəti sizin dəyərinizlə bağlı deyil. Bu, tamamilə onun daxili natamamlığı, emosional cəsarətsizliyi və zəif kommunikasiya qabiliyyəti ilə bağlıdır.<br/>
            2. <strong>"Bağlanış" (Closure) axtarmayın:</strong> Onun niyə getdiyini başa düşmək üçün ard-arda səs atmaq və ya yoxlamaq problemi həll etməyəcək. Onun yoxluğu onsuz da əldə edə biləcəyiniz ən böyük və net "Cavabdır". İşıqları söndürüb səssizcə çıxan birinin arxasınca qapını siz bir az daha bərk çırpın və bağlayın.
          </p>

          <hr className="my-8 border-border" />
          
          <p className="text-sm italic text-muted-foreground">
            Danyeri, öz profilini təsdiqləmiş və etibarlı nümayəndələrdən ibarətdir. Vaxtınızın belə məsuliyyətsiz davranışlara deyil, özünüzə layiq stabil və sevgi dolu namizədlərə sərf edilməsi üçün platformamızda <Link href="/tanisliq" className="text-primary hover:underline">tanışlıq xidmətlərini yoxlayın</Link>. Ən yaxşısına layiqsiniz!
          </p>
        </article>
      </main>
    </div>
  );
}
