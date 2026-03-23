import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/kisi-ve-qadinlarin-munasibetden-gozlentileri";
const TITLE = "Kişilərin və qadınların münasibətdən fərqli gözləntiləri";
const DESC = "Sosioloji qaydada niyə tez-tez anlaşılmazlıqlar yaşayırıq? Kişi beyni və qadın psixologiyasının münasibətdən istədikləri bəsit amma ən vacib fərqlər barədə oxuyun.";

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
    images: [{ url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function ExpectationsArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80" 
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
              Psixologiya ● Araşdırma
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              {TITLE}
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 6 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80"
              alt="Qadınların və Kişilərin Gözləntiləri"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Hər kəs sadəcə "sevilmək və xoşbəxt olmaq" istədiyini deyir, amma niyə reallıqda tərəflər ən xırda şeylərdən belə bir-birini anlaya bilmir? Evolyusion psixologiya, qadın və kişi beyinlərinin ehtiyacları analiz edərkən çox fərqli mexanizmlərlə işlədiyini sübut edib. Xoşbəxt cütlüklərin ən böyük sirri - öz dilində deyil, qarşı tərəfin dilində danışmağı (diqqət etməyi) bacarmaqdır.
          </p>

          <h2>Qadınların Ən Böyük Ehtiyacı: Dəyərli və Dinlənilmiş Hiss Etmək</h2>
          <p>
            Bir çox halda kişilər yanılır və düşünürlər ki, qadınlar həmişə maddi dəstək və ya yalnız lüks rəftar axtarır. Xeyr. Psixoloji araşdırmalara görə qadınların münasibətdəki bir nömrəli axtarışı <strong>emosional təhlükəsizlikdir</strong>. 
          </p>
          <p>
            Qadın bir problemi danışanda çox zaman "həll" axtarmır, "həmrəylik" axtarır. İşdəki problemindən danışan qadına kişinin praktiki yol göstərməsindən daha çox <em>"anlayıram ki, yorulmusan, mən sənin yanındayam"</em> deməsi qat-qat daha böyük sevgi nümayişidir. Qadın qərar verdiyi zaman qarşı tərəfin ona "dəyər verməsini" hiss etmək istəyir.
          </p>

          <h2>Kişilərin Ən Böyük Ehtiyacı: Təqdir Edilmək və Hörmət Görmək</h2>
          <p>
            Çox saylı cütlük terapiyalarında kişilərin əsas şikayəti eynidir: <em>"Nə etsəm də, yenə azdır, yenə tənqid olunuram."</em> Kişi psixologiyası təmsili "qəhrəman komleksi" üzərində qurulub. Onların münasibətdə ən çox ehtiyac duyduğu şey sevdikləri qadın tərəfindən kifayət qədər "yetərli" görünmək və təqdir edilməkdir.
          </p>
          <p>
            Balaca bir ev işini həll etdikdə, və ya işdən sonra vaxt ayırdıqda buna adi hal kimi baxıb tənqid etmək əvəzinə, fərqinə varıb təşəkkür edən qadın, kişini həmin münasibətə daha da çox bağlayır. Kişilər təqdir olunduqları və hörmət gördükləri yerdə qalmaq istəyərlər.
          </p>

          <h2>"Səni Sevirəm" Deməyin Fərqli Yolları</h2>
          <p>
            Qadınlar "səni sevirəm" deməyi ən çox detallara fikir verməklə, qayğı göstərməklə sübut edirlər. Onlar hesab edir ki, əgər o tərəfə sevgim varsa, ona sürprizlər etməliyəm, səslə ona bunu deməliyəm.
          </p>
          <p>
            Kişilər isə sözlərdən çox aksiyalara inanırlar. Kişi üçün sevgini göstərməyin yolu onu "qorumaq" və ya "həyatını asanlaşdırmaq" dır. Soyuq havada gödəkcəsini vermək, ağır yüklərini daşımaq, avtomobilini təmir etdirmək onun üçün emosional sevgi sözlərindən daha gerçəkdir.
          </p>

          <h2>Bəs Ortaq Nöqtə Nədir?</h2>
          <p>
            Münasibət ikitərəfli bir tərcümə aparatıdır. Qısa olaraq qayda budur: Qadına heç vaxt diqqətsiz olduğunu hiss etdirmə. Kişiyə isə heç vaxt yetərsiz (qeyri-kafi) olduğunu hiss etdirmə.
          </p>

          <hr className="my-8 border-border" />
          
          <p className="text-sm italic text-muted-foreground">
            Bütün bu gözləntiləri ortaq şəkildə qarşılaya biləcəyiniz sizinlə eyni dəyərləri paylaşan düzgün namizədi axtarırsınızsa əgər, dərhal <Link href="/tanisliq" className="text-primary hover:underline">Danyeri</Link>-də qeydiyyatdan keçib, "Axtardığım profil parametrləri" hissəsində detallı filtrlərlə sizə tam uyğun olan insanları kəşf edin.
          </p>
        </article>
      </main>
    </div>
  );
}
