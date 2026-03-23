import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStructuredData } from "@/components/StructuredData";

const URL = "https://www.danyeri.az/blog/az/ciddi-munasibet-axtararken-edilen-sehvler";
const TITLE = "Ciddi münasibət axtararkən edilən ən böyük səhvlər";
const DESC = "Niyə bəzən düzgün insanı tapmaq bu qədər çətin olur? Ciddi münasibət və evlilik axtarışında həm qadınların, həm də kişilərin yol verdiyi 5 əsas psixoloji səhv.";

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
    images: [{ url: "https://images.unsplash.com/photo-1501901609772-df0848060b33?w=800&q=80", width: 800, height: 533 }],
  },
};

export default function MistakesArticle() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleStructuredData 
        title={TITLE} 
        description={DESC} 
        url={URL} 
        imageUrl="https://images.unsplash.com/photo-1501901609772-df0848060b33?w=800&q=80" 
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
              Psixologiya ● Münasibətlər
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
              src="https://images.unsplash.com/photo-1501901609772-df0848060b33?w=800&q=80"
              alt="Ciddi münasibət axtararkən edilən səhvlər"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Hər kəs özünə uyğun, dəyərlərini bölüşən və gələcəyə birlikdə baxa biləcəyi birini axtarır. Xüsusilə Azərbaycan mühitində ciddi münasibət və evlilik fikri çox vaxt təzyiq və cəmiyyət normaları ilə əhatələnir. Belə vəziyyətlərdə həm qadınlar, həm də kişilər fərqində olmadan müəyyən səhvlərə yol verirlər ki, bu da doğru insanı tapmağı çətinləşdirir.
          </p>
          <p className="text-base leading-relaxed">
            Aşağıda ciddi münasibət axtarışında ən çox rast gəlinən psixoloji səhvlər qeyd olunub:
          </p>

          <h2>1. Tələsmək və Keçid Mərhələsini Atlamaq</h2>
          <p>
            Əgər ağlınızda yalnız "evlilik" məqsədi varsa, tanışlıq prosesinin təbii inkişafını gözardı edə bilərsiniz. Bir insana aşiq olmaqdan və ya onu tanımaqdan əvvəl onun "ideal həyat yoldaşı" olub-olmadığını sorğulamaq əlaqəyə süni bir rəsmilik və daxili təzyiq qatır. Qarşı tərəfi yalnız bir namizəd olaraq yox, ilk növbədə fərd olaraq tanımağa çalışın.
          </p>

          <h2>2. Xəyali Bir "Siyahı" İlə Gəzmək</h2>
          <p>
            Boyu belə olsun, maaşı bu qədər olsun, mütləq bu sahədə işləsin və s. Standartlarınızın olması sağlamdır, lakin həddindən artıq qatı və kəskin detallardan ibarət bir siyahı əsl gözəllikləri görməyinizə mane olur. Bəzən fərqli tərzdə, ehtiyacınız olduğunu belə bilmədiyiniz cəhətləri olan insanlar sizing üçün ən doğru insan ola bilər.
          </p>

          <h2>3. Keçmiş Yaraları Yeni Münasibətə Daşımaq</h2>
          <p>
            Keçmiş münasibətdə (və ya uğursuz tanışlıqlarda) yaşanmış incikliklər yeni tanıdığınız insana münasibətinizə təsir etməməlidir. "Bütün kişilər/qadınlar eynidir" kimi generalizasiyalar həm sizi daxilən bloklayır, həm də qarşınızdakı insana qarşı ədalətsizlikdir.
          </p>

          <h2>4. Mükəmməl İnsanı Gözləmək</h2>
          <p>
            Sosial mediada və kinolarda aşılanan "ideal cütlük" anlayışı reallıqdan uzaqdır. Bir insanın həm kariyerada çox uğurlu, həm hər saniyə romantik, həm daxilən mütləq sakit, həm də daim sizi əyləndirən biri olmasını gözləmək xəyal qırıqlığı yaradır. Hər kəsin qüsurları var. Sual budur ki: "Onun qüsurları mənim tam onluqla qəbul edə biləcəyim şeylərdirmi?"
          </p>

          <h2>5. Düzgün Ünsiyyət Qura Bilməmək və Gözləntiləri Gizlətmək</h2>
          <p>
            Bir çox halda insanlar tanışlığın ilk günlərində özünü süni olaraq olduğundan tamam fərqli biri kimi göstərməyə çalışır. Niyyətinizin ciddi olduğunu söyləməkdən (və ya əksinə, hələki yalnız tanımaq istədiyinizi bildirməkdən) çəkinməyin. Mövqedən qaçmaq yalnız gələcək konfliktlərə səbəb olur. Söhbəti səmimi saxlayın, Danyeri kimi dürüst platformalarda insanlar reallığı sevir.
          </p>

          <hr className="my-8 border-border" />
          
          <p className="text-sm italic text-muted-foreground">
            Danyeri, öz dəyərlərinizi qoruyaraq sizə uyğun, təsdiqlənmiş profillərlə ciddi bir yola çıxmaq üçün ən təhlükəsiz platformadır. Ciddi münasibət axtarışınızda artıq yuxarıdakı səhvləri bilərək <Link href="/discovery" className="text-primary hover:underline">kəşf etməyə</Link> başlaya bilərsiniz.
          </p>
        </article>
      </main>
    </div>
  );
}
