import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sağlam münasibətə aparan tanışlıq qaydaları",
  description:
    "Dəyərlər, sərhədlər, ünsiyyət və qarşılıqlı hörmət üzərində qurulan, sağlam münasibətə aparan tanışlıq qaydaları.",
  alternates: {
    canonical: "https://www.danyeri.az/blog/az/saglam-munasibete-aparan-tanisliq-qaydalari",
  },
  openGraph: {
    title: "Sağlam münasibətə aparan tanışlıq qaydaları",
    description:
      "Sadəcə tanış olmaq yox, uzunmüddətli və sağlam münasibət qurmaq üçün nələrə diqqət etməli?",
    url: "https://www.danyeri.az/blog/az/saglam-munasibete-aparan-tanisliq-qaydalari",
  },
};

export default function HealthyRelationshipRulesAzPage() {
  return (
    <div className="min-h-screen bg-background">
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
              Münasibətlər ● Sağlam sərhədlər
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              Sağlam münasibətə aparan tanışlıq qaydaları
            </h1>
            <p className="text-sm text-muted-foreground">
              Oxuma müddəti: təxminən 7 dəqiqə
            </p>
          </header>

          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
              alt="Sağlam münasibətə aparan tanışlıq qaydaları"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
          </div>

          <p className="text-base leading-relaxed">
            Hər tanışlıq münasibətə çevrilmir, hər münasibət də sağlam olmur. Sağlam münasibət
            üçün uyğun insan qədər, doğru qaydalar və sərhədlər də lazımdır. Bu yazıda tanışlıq
            mərhələsində diqqət etsəniz, gələcək münasibətiniz üçün möhkəm baza yaradacaq əsas
            qaydalara baxırıq.
          </p>

          <h2>1. Dəyərlərin uyğunluğu</h2>
          <p>
            Xarici görünüş və ilk kimya önəmli olsa da, uzunmüddətli münasibət üçün əsas
            təməl dəyərlərdir: ailəyə baxış, övlad, kariyera, din və həyat tərzi haqqında
            təsəvvürlərinizin tam eyni olmasa da, toqquşmayacaq qədər uyğun olması vacibdir.
          </p>
          <ul>
            <li>Erkən mərhələdə dəyərlər və həyat planları barədə açıq söhbətlər edin.</li>
            <li>“Sonra düzələr” deyib əsas fikir ayrılıqlarını görməməzlikdən gəlməyin.</li>
            <li>Öz dəyərlərinizdən utanmayın, onları gizlətməyin.</li>
          </ul>

          <h2>2. Sərhədlərə hörmət</h2>
          <p>
            Sağlam münasibətin ən aydın göstəricilərindən biri qarşılıqlı sərhəd hörmətidir.
            Mesajlara cavab saatınızdan tutmuş, şəxsi zamanınıza və sosial dairənizə qədər
            hər şeydə bu özünü göstərir.
          </p>
          <ul>
            <li>Sizə “vaxtında yazmadığın üçün inciyirəm” deyən yox, səbəbi soruşan insan daha uyğundur.</li>
            <li>Öz şəxsi vaxtınızın, hobbilərinizin və dost çevrənizin qalmasına icazə verən münasibət seçin.</li>
            <li>Əgər sərhəd qoyduqda qarşı tərəf əsəbiləşirsə, bu ciddi xəbərdarlıq siqnalıdır.</li>
          </ul>

          <h2>3. Açıq və hörmətli ünsiyyət</h2>
          <p>
            Sağlam münasibətdə tərəflər narahatlıqlarını və ehtiyaclarını qorxmadan, hörmətli
            formada ifadə edə bilirlər. Söhbət təkcə romantik komplimentlərdən yox, real
            problemlər haqqında danışa bilməkdən gedir.
          </p>
          <ul>
            <li>Sual verdiyiniz zaman sizə əsəbiləşmək əvəzinə izah etməyə çalışan insanlara diqqət edin.</li>
            <li>Müzakirələrdə “sən həmişə”, “sən heç vaxt” kimi ümumiləşdirici cümlələrdən qaçmaq önəmlidir.</li>
            <li>Konflikt zamanı susmaq və ya yoxa çıxmaq (“ghosting”) əvəzinə dialoq axtaran tərəf sağlam münasibət üçün daha uyğundur.</li>
          </ul>

          <h2>4. Hisslər və məntiq arasında balans</h2>
          <p>
            Güclü kimya və emosiyalar gözəldir, amma qərarları yalnız bu hisslərin üzərində
            qurmaq risklidir.
          </p>
          <h3>Özünüzə verin</h3>
          <ul>
            <li>"Bu insanla tərəfdaşlıq edə bilərəmmi?"</li>
            <li>"Gələcəkdə problem həll etmə tərzimiz uyğun görünürmü?"</li>
          </ul>

          <h2>5. Özünüzü itirməmək</h2>
          <p>
            Münasibət nə qədər gözəl olsa da, öz dəyərinizi yalnız qarşı tərəfin sizə
            münasibətinə bağlamamaq vacibdir. Sağlam münasibətdə siz özünüzü daha güclü,
            daha dəyərli, daha sakit hiss edirsiniz – daha kiçik yox.
          </p>

          <p>
            Ən sağlam münasibətlər, hər iki tərəfin öz fərdiliyini qoruduğu, amma eyni
            zamanda “komanda kimi” hərəkət etdiyi münasibətlərdir. Tanışlıq mərhələsində
            bu balansı hiss etməyə çalışın.
          </p>
        </article>

        <section className="mt-10 md:mt-12 rounded-3xl border border-primary/30 bg-linear-to-br from-primary/10 via-pink-500/10 to-primary/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Sağlam münasibət üçün ilk addımı atın
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-5 max-w-xl">
            Danyeri, ciddi münasibət və evlilik niyyəti olan insanlar üçün hazırlanmış,
            dəyərlərə və hörmətə əsaslanan tanışlıq mühitidir. Əgər siz də belə mühit 
            axtarırsınızsa, ilk addımı bu gün ata bilərsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sign-up">Təhlükəsiz tanışlığı sınamaq üçün qeydiyyat et</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/about">Qaydalarımızla və dəyərlərimizlə tanış ol</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

