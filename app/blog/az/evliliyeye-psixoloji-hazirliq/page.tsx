import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/evliliyeye-psixoloji-hazirliq";
const TITLE = "Evlilik üçün psixoloji olaraq hazır olduğunuzu necə anlamaq olar?";
const DESC = "Evlilik yalnız sevgi deyil, həm də komanda işidir. Ciddi münasibətə və evliliyə psixoloji hazır olduğunuzu göstərən əsas əlamətlər və mütəxəssis rəyləri.";

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
    images: [{ url: "https://images.unsplash.com/photo-1544027419-4afdb7c15278?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function MarriagePrepArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1544027419-4afdb7c15278?w=800&q=80" 
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
              Psixologiya ● Ailə
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
              src="https://images.unsplash.com/photo-1544027419-4afdb7c15278?w=800&q=80"
              alt="Evliliyə Psixoloji Hazırlıq"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Müasir cəmiyyətdə evlilik qərarı çox vaxt yaş, ailə təzyiqi və ya “artıq vaxtıdır” düşüncəsi ilə alınır. Lakin, statistika və psixoloji araşdırmalar göstərir ki, ən xoşbəxt və uzunmüddətli ailələr daxilən və emosional olaraq bu prosesə hazır olan fərdlər tərəfindən qurulur. Bəs sevgi və ehtirasdan savayı, insanın evliliyə hazır olduğunu göstərən psixoloji əlamətlər hansılardır?
          </p>

          <h2>1. Özbaşına (Təkbaşına) Xoşbəxt Olmağı Bacarmaq</h2>
          <p>
            Ən böyük yalanlardan biri insanların öz "yarısını" axtarmalarıdır. Kliniki psixoloqlar qeyd edir ki, sağlam bir evlilik iki "yarımçıq" fərdin deyil, daxilən bütöv və özbaşına xoşbəxt ola bilən iki insanın birliyidir. Əgər siz daim "biri gəlsin və həyatımı xilas etsin", "məni yalnızlıqdan qurtarsın" deyə düşünürsünüzsə, bu evliliyə yox, xilaskara ehtiyacınız olduğunu göstərir. Təkbaşına olanda özünüzü tam hiss edirsinizsə, evliliyə bir o qədər hazırsınız demədir.
          </p>

          <h2>2. Emosional Reaktivlikdən Qurtulmaq</h2>
          <p>
            Mübahisələr hər münasibətin qaçınılmaz hissəsidir. Hazır olduğunuzun ən böyük əlaməti isə, konflikt zamanı aqressiv reaksiyalar vermək, səlahiyyət savaşına girmək və ya susaraq partnyoru "cəzalandırmaq" əvəzinə problemin həllinə fokuslana bilməyinizdir. "Mən haqlıyam" əvəzinə "Biz bu problemi necə həll edə bilərik?" təfəkkürünə sahibsinizsə, psixoloji yetkinliyə çatmısınız deməkdir.
          </p>

          <h2>3. Keçmişlə Hesablaşmanın Tamamlanması</h2>
          <p>
            Evliliyə gedən yolda köhnə münasibətlərin yaraları, uşaqlıq travmaları və keçmiş uğursuzluqlar artıq sizi idarə etməməlidir. Əgər ürəyinizdə hələ də kiməsə qarşı dərin qəzəb, inciklik varsa və bu sizin reaksiyalarınızı təyin edirsə, yeni bir təməl atmaq çətinləşəcək. Keçmiş səhvlər artıq yalnız bir dərdirsə, siz hazırsınız.
          </p>

          <h2>4. Gözləntilərin Reallaşması (Realizm)</h2>
          <p>
            Sosial mediada gördüyümüz hər gün çiçəklərin gəldiyi, heç müzakirələrin olmadığı "mükəmməl" ailə tablosu bir xəyaldır. Psixoloji olaraq evliliyə hazır olan fərdlər, münasibətin bəzən rutindən ibarət ola biləcəyini, maliyyə və sağlamlıq böhranlarının çıxacağını, sevginin ehtirasdan çox sadiqlik və hörmətə söykənəcəyini əvvəlcədən dərk edirlər.
          </p>

          <h2>5. Sərhədlər Təyinetmə Bacarığı</h2>
          <p>
            Sağlam evliliyin mərkəzində hər iki tərəfin fərdi məkana sahib ola bilməsi dayanır. Evlənmək hər dəqiqəni birlikdə keçirmək və fərdiliyi itirmək demək deyil. Siz, "Mən" deməyin eqoizm olmadığını, fərdi hobbilərin və maraqların evliliyi daha da zənginləşdirdiyini başa düşdükdə doğru addımı ata bilərsiniz.
          </p>

          <hr className="my-8 border-border" />
          
          <p className="text-sm italic text-muted-foreground">
            Özünüzü tam hazır hiss etdiyinizdə, sizinlə eyni dəyərləri paylaşan düzgün insanla tanış olmaq prosesin vacib hissəsidir. Danyeri məhz psixoloji yetkinliyə çatmış və <Link href="/discovery" className="text-primary hover:underline">ciddi münasibətə hazır olan insanların</Link> görüşdüyü etibarlı platformadır.
          </p>
        </article>
      </main>
    </div>
  );
}
