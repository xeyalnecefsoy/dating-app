import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/sevgi-yoxsa-manipulyasiya-gaslighting";
const TITLE = "Sevgi yoxsa manipulyasiya? Gaslighting-i necə tanımaq olar?";
const DESC = "Münasibətdə özünüzdən şübhələnməyə, davamlı özünüzü günahkar hiss etməyə başlamısınız? 'Gaslighting' nədir və ondan necə qorunmaq olar?";

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
    images: [{ url: "https://images.unsplash.com/photo-1510427847426-ed837012678f?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function GaslightingArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1510427847426-ed837012678f?w=800&q=80" 
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
              Psixologiya ● Red flags
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              {TITLE}
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 7 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1510427847426-ed837012678f?w=800&q=80"
              alt="Gaslighting"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Hər şey fantastik sevgi, intensiv diqqət və gözəl sözlərlə başlamışdı. Amma zaman keçdikcə özünüzü təcrid olunmuş, öz yaddaşınızdan, verdiyiniz qərarlardan və hətta ağlınızdan şübhə edərkən tapırsınız. Bu halın elmi və psixoloji adı var: <strong>Gaslighting (Qaslaytinq)</strong>. Münasibətlərin ən toksik və gözəgörünməz manipulyasiya növüdür.
          </p>

          <h2>Gaslighting Nədir?</h2>
          <p>
            Bu, tərəflərdən birinin digərinə reallıq hissini inkar edərək, ona "sən səhv xatırlayırsan", "sən çox həssassan" və ya "bu elə olmadı" kimi iddialar edərək psixoloji hakimiyyət qurmasıdır. Bir növ qurbanın öz yaddaşına və mühakimə qabiliyyətinə inamını təməldən qırmağı hədəfləyən zəhərli sistemdir.
          </p>

          <h2>Aşkar Əlamətləri Necə Tanımalı?</h2>
          <ul>
            <li><strong>Yaddaşı təkzib:</strong> Açıq şəkildə söylənmiş bir sözü inkar edirlər. "Mən belə bir şey deməmişəm, sən uydurursan."</li>
            <li><strong>Təcrid etmək:</strong> Sizi dostlarınızın və ya ailənizin "sizin üçün pis" olduğuna inandırırlar. Məqsəd, sizdə "mən yalnız onunla təmiz reallıqdayam" hissi yaratmaqdır.</li>
            <li><strong>Həssaslıqda ittiham:</strong> Reaksiya verdikdə və ədalətsizliyə səs çıxarıldıqda, dərhal <em>"Sən həmişə hər şeyi böyüdürsən"</em> və ya <em>"Sən çox emosional və aqressivsən"</em> cümlələri ilə rastlaşmaq.</li>
            <li><strong>Proyeksiya:</strong> Öz günahlarını və mənfi davranışlarını (yalan, sədaqətsizlik) sizin üstünüzə atmaq.</li>
          </ul>

          <h2>"Sən sadəcə çox emosionalsan" - Kliniki Nöqteyi Nəzərdən</h2>
          <p>
            Gaslighting tətbiq edən (adətən narsistik xarakter xüsusiyyətlərinə sahib) insanlar, sizin verdiyiniz reaksiyaları qeyri-rəsional göstərməkdə ustadırlar. Zamanla qurban <em>"Görəsən o haqlıdır? Bəlkə mən doğrudan da psixoloji olaraq həssas və problemliyəm?"</em> deyərək terapiya ehtiyacı hiss etməyə başlayır, halbuki problem tamamilə kənar manipulyasiyadan qaynaqlanır.
          </p>

          <h2>Necə Qorunmaq Olar?</h2>
          <p>
            1. Münasibətdə narahat vəziyyətlərin, reaksiyaların və vədlərin gündəliyini tutun (yalnız özünüzə sübut etmək üçün).<br/>
            2. Etibarlı 3-cü tərəflərlə (dost, psixoloq) vəziyyəti müzakirə edin və onlardan reallıq yoxlanışı alın.<br/>
            3. "Mənim reallığım qətidir" prinsiplərini bərpa edin; qarşı tərəfin inkarı sizin məntiqinizi yuyub aparmamalıdır.
          </p>

          <hr className="my-8 border-border" />
          
          <p className="text-sm italic text-muted-foreground">
            Bu kimi təhlükəli münasibət strukturlarından (red-flags) erkən xəbərdar olmaq fərdi rifahınız uçun kritikdir. Tanışlıqda sağlam qərarlar və təhlükəsiz seçimlər etmək üçün <Link href="/discovery" className="text-primary hover:underline">Danyeri</Link>, yalnız profilləri yoxlanmış, istifadəçi təhlükəsizliyinə dəyər verən bir platforma təklif edir. Ciddi və səmimi tanışlıq üçün qeydiyyatdan keçməyi unutmayın!
          </p>
        </article>
      </main>
    </div>
  );
}
