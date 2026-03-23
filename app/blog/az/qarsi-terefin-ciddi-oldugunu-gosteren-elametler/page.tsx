import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/qarsi-terefin-ciddi-oldugunu-gosteren-elametler";
const TITLE = "Qarşı tərəfin ciddi olduğunu göstərən 5 əlamət";
const DESC = "Sizinlə sadəcə vaxt keçirir yoxsa doğrudan da ciddi fikirlidir? İnsan psixologiyasında narsist hərəkətlərdən uzaq, stabil gələcək vəd edən tərəfdaşın 5 gizli əlaməti.";

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
    images: [{ url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function SeriousActionsArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&q=80" 
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
              Məsləhətlər ● Psixologiya
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
              src="https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&q=80"
              alt="Ciddi münasibət"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Yeni bir tanışlıqda, xüsusən də online platformalardan başlayan münasibətlərdə hər kəsin ağlındakı əsas sual budur: "Onun niyyəti doğrudan da ciddidir, yoxsa sadəcə vaxt keçirir?" Sözlər yalan danışa bilsə də, psixologiya və davranış nümunələri heç vaxt aldatmır.
          </p>

          <h2>1. Stabil Ünsiyyət və Proqnozlaşdırıla bilmək</h2>
          <p>
            Ən aydın göstərici "gözlənilməzlikdən" uzaq olmaqdır. Ciddi fikri olmayan insan bəzən 24 saat dayanmadan yazar, bəzən isə günlərlə itkin düşər. Bu "isti-soyuq" oyunları qeyri-ciddiliyin başlıca siqnalıdır. Əksi olaraq, stabil niyyətli insan eyni rutində, eyni diqqətlə əlaqə qurur. Sizi maraqda, intizarda qoymur, harda və niyə məşğul olduğunu səbəbsizcə yox olmağa üstün tutaraq əvvəlcədən bildirir.
          </p>

          <h2>2. Sizin "Kiçik Detallarınızı" Xatırlayır</h2>
          <p>
            Əgər bir neçə həftə əvvəl etdiyiniz söhbətdə çay əvəzinə kofe sevdiyinizi, və ya hansı mahnının sizə uşaqlığı xatırlatdığını demişdinizsə, və o bunu unutmursa, bu sadəcə yaxşı yaddaş fəsadı deyil. Beyin yalnız xüsusi diqqət ayırdığı və "uzunmüddətli" faylda saxlamaq istədiyi detalları yadda saxlayır. Bu cür kiçik yatırımlar insanın sizə olan yüksək marağının ən təmiz göstəricisidir.
          </p>

          <h2>3. "Mən" yox, "Biz" Düşüncəsi</h2>
          <p>
            Planlar qurarkən fərqində olmadan istifadə edilən əvəzliklər çox şey deyir. Əgər qarşı tərəf "Mən bu yay tətilə gedəcəm" əvəzinə "Biz bəlkə yayda filan yerə gedərik" deyirsə, bu o deməkdir ki, o, qeyri-ixtiyari olaraq öz gələcək ssenarilərində sizi artıq bir partnyor kimi formalaşdırıb.
          </p>

          <h2>4. Konfliktlərdən Qaçmır, Həll Edir</h2>
          <p>
            Mübahisələr ən yaxşı test meydançasıdır. Vaxt keçirmək istəyən insan, kiçik bir anlaşılmazlıq olan kimi ya aqressiya göstərib aralaşar, ya da "sən çox qəlizsən" deyib məsuliyyətdən qaçar. Amma ciddi insan konstruktiv tənqidə açıq olur. O, itirməkdən qorxduğu üçün dinləyir və ortaq məxrəcə gəlmək üçün eqosunu kənara qoya bilir.
          </p>

          <h2>5. Sosial Dairəsinə İnteqrasiya</h2>
          <p>
            İnsanın sizi həqiqətən həyatında istədiyinin tam sübutu - sizi öz comfort zonasına (ailəsi, iş yoldaşları və ya ən yaxın dostları) daxil etməsidir. Sizi gizlətmir, fəxrlə cəmiyyət içinə çıxardır və "Mənim sevdiyim" statusunu qürurla qəbul edir.
          </p>

          <hr className="my-8 border-border" />
          
          <p className="text-sm italic text-muted-foreground">
            Sizin dəyərinizi bilən və münasibətə eyni ciddiyyətlə yanaşan namizədlər tapmaq artıq daha asandır. <Link href="/tanisliq" className="text-primary hover:underline">Danyeri</Link>-də Azərbaycanın müxtəlif yerlərindən həqiqi, təsdiqlənmiş və yalnız ciddi niyyətli insanlarla təhlükəsiz şəkildə tanış ola bilərsiniz.
          </p>
        </article>
      </main>
    </div>
  );
}
