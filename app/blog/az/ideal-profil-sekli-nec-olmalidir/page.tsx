import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/ideal-profil-sekli-nec-olmalidir";
const TITLE = "Daha çox diqqət çəkən və güvən yaradan ideal profil şəkli necə olmalıdır?";
const DESC = "Danyeri və digər tanışlıq tətbiqlərində ilk təəssürat şəkildən başlayır. Profil şəklini seçərkən nələrə diqqət etməli və hansı səhvlərdən qaçmalı olduğunuzu öyrənin.";

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
    images: [{ url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function ProfilePictureArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80" 
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
              Məsləhətlər ● Profil
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              {TITLE}
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 4 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
              alt="İdeal profil şəkli"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Hər kəs bilir ki, vizual təəssürat ən sürətli və güclü olanıdır. Danyeri kimi ciddi bir platformada belə, şəkil profilinizin ən kritik hissələrindən biridir. Keyfiyyətsiz, qaranlıq və ya təbii olmayan şəkillər istifadəçilərdə qeyri-ciddilik və bəzən güvənsizlik hissi yaradır.
          </p>
          <p className="text-base leading-relaxed">
            Bəs daha çox maraq cəlb etmək və etibarlı, xoş bir təəssürat yaratmaq üçün hansı şəkilləri seçməliyik?
          </p>

          <h2>1. Gülümsəmək Ən Yaxşı Aksesuardır</h2>
          <p>
            Kameraya ciddi və ya çox aqressiv şəkildə baxmaq insanların sizə yazmasına mane ola bilər. Təbii, səmimi bir təbəssüm, qarşı tərəfə sizin əlçatan, xoşxasiyyət və pozitiv biri olduğunuzu göstərir. Psixoloji olaraq insanlar gülərüz profilləri daha etibarlı hesab edirlər.
          </p>

          <h2>2. Tək Olduğunuz, Aydın Bir Yaxın Plan Şəkili</h2>
          <p>
            Qrup şəkilləri əyləncəlidir, amma ilk profil şəkli olaraq uyğun deyil. Heç kim 5 nəfərin içindən sizin hansı olduğunuzu tapmağa çalışmaq istəmir. Üzünüzün aydın göründüyü, eynəksiz və ya papaqsız, yaxşı işıqlandırılmış (mümkünsə təbii gün işığında) tək bir foto ideal başlanğıcdır.
          </p>

          <h2>3. Xobbilərinizi və Həyat Tərzinizi Göstərin</h2>
          <p>
            Digər şəkillərinizi (2-ci, 3-cü şəkil) xarakterinizi göstərmək üçün istifadə edin. Əgər səyahəti sevirsinizsə bir təbiət fotosu, kitab oxumağı sevirsinizsə kofe stolu arxasında bir foto və ya ev heyvanınızla olan şəkliniz sizi olduqca səmimi və maraqlı göstərəcək. Bu həm də qarşı tərəfə <strong>ilk mesajı yazmaq üçün əla bir bəhanə</strong> verir.
          </p>

          <h2>Bu Səhvlərdən Qaçın</h2>
          <ul>
            <li><strong>Həddindən artıq filtr (Snapchat qulaqları vs.):</strong> Siz real bir münasibət axtarırsınız, buna görə də real görünüşünüzü gizlətməyin.</li>
            <li><strong>Ayna Qarşısında Selfie (Xüsusilə idman zalında)</strong>: Bu bəzən narcissistik bir aura yarada bilər, təbii çəkilmiş şəkillər həmişə daha cəlbedicidir.</li>
            <li><strong>Qaranlıq və ya bulanıq fotolar:</strong> Güvən zədələyən ilk faktor qeyri-müəyyən və bulanıq təsvirlərdir.</li>
          </ul>

          <p className="text-base leading-relaxed mt-6">
            Son olaraq, unutmayın ki, profil şəkli daxili dünyanızın kiçik bir vitrinidir. Şəkilləriniz nə qədər səmimi və aydın olarsa, qayğıkeş və doğru insanların diqqətini çəkmək ehtimalınız bir o qədər yüksələr. Siz də <Link href="/profile" className="text-primary hover:underline">profilinizi yeniləyərək</Link> şansınızı artırın!
          </p>
        </article>
      </main>
    </div>
  );
}
