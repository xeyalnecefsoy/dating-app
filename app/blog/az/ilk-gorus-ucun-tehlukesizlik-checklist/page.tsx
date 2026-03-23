import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "İlk görüş üçün təhlükəsizlik checklist",
  description:
    "İlk dəfə üz-üzə görüşə gedərkən təhlükəsiz qalmaq üçün addım-addım təhlükəsizlik checklist-i: məkan seçimi, yaxınlara xəbər vermək, sərhədlər və çıxış planı.",
  alternates: {
    canonical: "https://www.danyeri.az/blog/az/ilk-gorus-ucun-tehlukesizlik-checklist",
  },
  openGraph: {
    title: "İlk görüş üçün təhlükəsizlik checklist",
    description:
      "Online tanışlıqdan real həyata keçərkən təhlükəsizliyi qorumaq üçün praktik, yadda qalan checklist.",
    url: "https://www.danyeri.az/blog/az/ilk-gorus-ucun-tehlukesizlik-checklist",
  },
};

export default function FirstDateChecklistAzPage() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={metadata.title as string} 
        description={metadata.description as string} 
        url={metadata.alternates?.canonical as string} 
        imageUrl="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80" 
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
              İlk görüş ● Təhlükəsizlik checklist
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              İlk görüş üçün təhlükəsizlik checklist
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 5 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80"
              alt="İlk görüş üçün təhlükəsizlik checklist"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Online tanışlıq mərhələsindən sonra ilk dəfə üz-üzə görüşə getmək həm həyəcanlı,
            həm də bir az gərgin ola bilər. Hissləriniz tamamilə normaldır. Bu checklist,
            ilk görüşdə özünüzü daha güvəndə hiss etməyiniz və nəzarəti əlinizdə saxlamanız
            üçün hazırlanıb.
          </p>

          <h2>1. Məkan seçimi</h2>
          <ul>
            <li>Həmişə ictimai, insanların sıx olduğu məkanı seçin (kafe, restoran, mərkəz və s.).</li>
            <li>Çox sakit, uzaq və ya qapalı məkanlarda ilk görüşə getməyin.</li>
            <li>Əgər mümkündürsə, əvvəldən tanıdığınız və özünüzü rahat hiss etdiyiniz yeri seçin.</li>
          </ul>

          <h2>2. Nəqliyyat və gediş-gəliş</h2>
          <ul>
            <li>İlk görüşdə qarşınızdakı insanın maşını ilə getməyə tələsməyin.</li>
            <li>Öz gediş-gəlişinizi özünüz planlaşdırın (taksi, ictimai nəqliyyat və s.).</li>
            <li>Görüş yerindən evə necə qayıdacağınızı əvvəldən müəyyən edin.</li>
          </ul>

          <h2>3. Yaxınlarınıza xəbər verin</h2>
          <ul>
            <li>Görüş yerini, saatını və kimlə görüşdüyünüzü ən azı bir nəfər yaxınınıza deyin.</li>
            <li>Əgər özünüzü narahat hiss edirsinizsə, qısa müddətdə bir “yaxşıyam” mesajı göndərməyi planlaşdırın.</li>
            <li>Telefonunuzun şarjının kifayət etdiyindən əmin olun.</li>
          </ul>

          <h2>4. Sərhədlər və bədən dili</h2>
          <ul>
            <li>İlk görüşdə fiziki məsafəni özünüz üçün komfortlu hesab etdiyiniz səviyyədə saxlayın.</li>
            <li>Əgər hər hansı toxunuş, zarafat və ya mövzu sizi narahat edirsə, bunu sakit, amma aydın şəkildə deyə bilərsiniz.</li>
            <li>“Yox” deməkdən çəkinməyin; bu, sizin haqqınızdır.</li>
          </ul>

          <h2>5. Spirtli içki və qərar vermə</h2>
          <ul>
            <li>Əgər spirtli içki içirsinizsə, özünüzü itirməyəcəyiniz qədər məhdud miqdarda qəbul edin.</li>
            <li>Heç vaxt içki və ya yeməyi gözdən qaçırmayın.</li>
            <li>Gərgin və ya qeyri-müəyyən hiss etdiyiniz anda görüşü qısaltmaq tamamilə normaldır.</li>
          </ul>

          <h2>6. Çıxış planı</h2>
          <p>
            Özünüzü narahat hiss etdiyiniz təqdirdə görüşü nəzakətlə bitirmək üçün hazır bir
            cümləniz olsun.
          </p>
          <h3>Nümunə cümlələr</h3>
          <ul>
            <li>“Mən artıq getməliyəm, tanış olduğumuza şadam.”</li>
            <li>“Bu gün özümü bir az yorğun hiss edirəm, görüşü qısa kəssək, pis olmaz.”</li>
          </ul>

          <p>
            Əsas məqsəd – özünüzü tam təminatda hiss etmədiyiniz vəziyyətdə nə edəcəyinizi əvvəlcədən
            bilməkdir. Bu, həm təhlükəsizlik, həm də psixoloji rahatlıq üçün çox vacibdir.
          </p>
        </article>

        <section className="mt-10 md:mt-12 rounded-3xl border border-primary/30 bg-linear-to-br from-primary/10 via-pink-500/10 to-primary/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            İlk görüşə daha hazırlıqlı getmək istəyirsiniz?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-5 max-w-xl">
            Danyeri, ciddi münasibətə fokuslanan insanları bir araya gətirməklə yanaşı, 
            təhlükəsiz tanışlıq mədəniyyətini dəstəkləyən qaydalar və icma standartları ilə
            hazırlanıb. İlk addımı platforma daxilində daha güvənli mühitdə ata bilərsiniz.
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

