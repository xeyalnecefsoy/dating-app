import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/ilk-mesaji-nece-yazmali";
const TITLE = "İlk mesajı necə yazmalı? Diqqət çəkən başlanğıc üçün qaydalar";
const DESC = "Darıxdırıcı 'Salam, necəsən?' mesajından qurtulun. Qarşı tərəfin diqqətini dərhal cəlb edəcək və söhbəti başlamağa kömək edən ilk mesaj taktikaları.";

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
    images: [{ url: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function FirstMessageArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80" 
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
              Münasibət Məsləhətləri ● Online tanışlıq
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
              src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80"
              alt="İlk mesajı necə yazmalı"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Online tanışlıq tətbiqlərində ilk təəssürat hər şeydir və bu, düzgün ilk mesajdan başlayır. Çox vaxt eşidirik ki, həm kişilər, həm də qadınlar darıxdırıcı “Salam, necəsən?” və ya sadəcə bir əl yelləmə emojisi (👋) ilə gələn mesajlardan yorulublar. Belə mesajlar söhbəti başlatmaq cəhdini tamamilə qarşı tərəfin üzərinə atır və çox nadir hallarda həvəsli bir cavab alır.
          </p>
          <p className="text-base leading-relaxed">
            Bəs diqqət çəkən ilk mesaj necə olmalıdır? Budur sizin üçün 5 əsas qayda:
          </p>

          <h2>1. Profilə Dair Xüsusi Bir Detala Diqqət Yetirin</h2>
          <p>
            Qarşı tərəfin profilinə daxil olun, şəkillərinə, "Maraqlar" bölməsinə və ya "Haqqında" yazısına yaxından baxın. Ümumi suallardansa, onun şəxsiyyətinə toxunan mesajlar göndərin.
          </p>
          <p><em>Nümunə:</em> “Profilindəki dağ şəklini gördüm, hansı yüksəkliyə qalxmısan? Mən də qayaya dırmanmağa maraqlıyam.”</p>
          <p><em>Niyə işləyir?</em> İnsana xüsusi olduğunu hiss etdirir və profilinə həqiqətən baxdığınızı göstərir.</p>

          <h2>2. Söhbəti Aktiv Şəkildə Başladın (Açıq Uclu Suallar)</h2>
          <p>
            “Salam, günün necə keçir?” sualına adətən “Yaxşıyam, sənin?” kimi rutin bir cavab gəlir və söhbət tıxanır. Sualınızı açıq uclu formalaşdırın ki, böyük cümlələrlə cavab vermək üçün imkan (və həvəs) yaransın.
          </p>
          <p><em>Nümunə:</em> “Bütün həftəsonu üçün ancaq bir film seçə bilsəydin, komediya olardı yoxsa triller?”</p>

          <h2>3. Gülməli və Yaradıcı Olmaqdan Çəkinməyin</h2>
          <p>
            Heç kim çox ciddi və monoton mesajlarla qarşılanmaq istəmir. Ciddi bir platformada olsanız belə (Danyeri kimi), zarafatcıl tərəfinizi göstərmək həmişə üstünlükdür. Xəbərdarlıq: Yumor sərhədləri aşmamalı və ədəbli olmalıdır.
          </p>
          <p><em>Nümunə:</em> “Əgər zombi apokalipsisi varsaydıq, səncə ilk sən sağ qalardın, yoxsa mən?”</p>

          <h2>4. Çox Uzatmayın, Amma Çox Da Qısa Kəsməyin</h2>
          <p>
            Nə dastan kimi 15 cümləlik paragraf, nə də yarımçıq bir kəlmə. İlk mesajınızın ideal uzunluğu orta hesabla iki cümlə olmalıdır. Qısa, aydın, bir az səmimi sualla bitən ideal ölçüdür.
          </p>

          <h2>5. Dərhal Görüşə və Şəxsi Məlumata Keçməyin</h2>
          <p>
            “Salam, neçə yaşın var, harada qalırsan, görüşək?” Bu, insanın fərdi məkanına çox sürətli və aqressiv girişdir. Bu cür yanaşma əksər hallarda səssizliyiniz və ya cütləşmənin ləğv edilməsi (match-in silinməsi) ilə nəticələnəcək. Səbrli olun, söhbəti bir neçə gün (və ya ən azı bir neçə saat) boyunca maraqlı tutmağa çalışın ki, görüşmə qərarı təbii şəkildə formalaşsın.
          </p>

          <hr className="my-8 border-border" />
          
          <p className="text-sm italic text-muted-foreground">
            Danyeri-nin mesajlaşma bölməsində təhlükəsizlik və məxfilik qorunduğu üçün emosional intellektinizi işə salıb unikal mesajlarla şansınızı dərhal artıra bilərsiniz. Hələ yoxlamamısınızsa, <Link href="/discovery" className="text-primary hover:underline">insanları kəşf edərək</Link> şansınızı yoxlayın!
          </p>
        </article>
      </main>
    </div>
  );
}
