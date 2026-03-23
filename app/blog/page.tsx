import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Shield, AlertTriangle, HeartHandshake, CheckSquare, MessageCircle, AlertOctagon, UserCircle, BrainCircuit, HeartPulse, Sparkles, Target, Scale, Ghost } from "lucide-react";
import { BlogBannerSlider } from "@/components/BlogBannerSlider";

export const metadata: Metadata = {
  title: "Danyeri Bloq - Tanışlıq, Münasibətlər və Psixologiya",
  description:
    "Azərbaycanda təhlükəsiz online tanışlıq, ilk mesaj qaydaları, məxfilik, sağlam münasibət qurmaq və psixologiya haqqında maarifləndirici yazılar.",
  alternates: {
    canonical: "https://www.danyeri.az/blog",
  },
  openGraph: {
    title: "Danyeri Bloq | Tanışlıq, Münasibətlər, Psixologiya",
    description:
      "Online tanışlıqda uğur qazanmaq, ilk görüş qaydaları, təhlükəsizlik və sağlam münasibətlər üçün praktiki məsləhətlər.",
    url: "https://www.danyeri.az/blog",
  },
};

const bannerSlides = [
  {
    tag: "Təhlükəsizlik bələdçisi",
    title: "Online tanışlıqda özünüzü necə qorumalısınız?",
    description:
      "Profil məlumatları, foto və ilk görüş üçün ən vacib 5 qaydanı bir yerdə oxuyun.",
    href: "/blog/az/tehlukesiz-online-tanisliq",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80",
  },
  {
    tag: "İlk mesaj",
    title: "İlk mesajı necə yazmalı?",
    description:
      "Darıxdırıcı 'Salam, necəsən?' mesajından qurtulun və qarşı tərəfin diqqətini dərhal cəlb edin.",
    href: "/blog/az/ilk-mesaji-nece-yazmali",
    image:
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80",
  },
  {
    tag: "Psixologiya",
    title: "Ciddi münasibət axtararkən edilən ən böyük səhvlər",
    description:
      "Niyə bəzən düzgün insanı tapmaq çətin olur? Evlilik axtarışında fərqində olmadan etdiyimiz psixoloji səhvlər.",
    href: "/blog/az/ciddi-munasibet-axtararken-edilen-sehvler",
    image:
      "https://images.unsplash.com/photo-1501901609772-df0848060b33?w=800&q=80",
  },
];

const posts = [
  {
    slug: "az/qarsi-terefin-ciddi-oldugunu-gosteren-elametler",
    title: "Qarşı tərəfin ciddi olduğunu göstərən 5 əlamət",
    description:
      "Sizinlə sadəcə vaxt keçirir yoxsa doğrudan da ciddi fikirlidir? Stabil gələcək vəd edən tərəfdaşın 5 gizli əlaməti.",
    icon: Target,
    category: "Məsləhətlər",
  },
  {
    slug: "az/kisi-ve-qadinlarin-munasibetden-gozlentileri",
    title: "Kişilərin və qadınların münasibətdən fərqli gözləntiləri",
    description:
      "Sosioloji qaydada niyə tez-tez anlaşılmazlıqlar yaşayırıq? Kişi beyni və qadın psixologiyasının ən vacib fərqləri.",
    icon: Scale,
    category: "Psixologiya",
  },
  {
    slug: "az/ghosting-nedir-ve-nece-qorunmali",
    title: "Ghosting nədir və bu zərərli trenddən necə qorunmaq olar?",
    description:
      "Qarşı tərəfin anidən yoxa çıxması (Ghosting) psixologiyası. Bu travmadan necə qurtulmalı və əvvəlcədən necə hiss etməli?",
    icon: Ghost,
    category: "Red flags",
  },
  {
    slug: "az/evliliyeye-psixoloji-hazirliq",
    title: "Evlilik üçün psixoloji olaraq hazır olduğunuzu necə anlamaq olar?",
    description:
      "Evlilik yalnız sevgi deyil, həm də komanda işidir. Ciddi münasibətə və evliliyə psixoloji hazır olduğunuzu göstərən əsas əlamətlər.",
    icon: BrainCircuit,
    category: "Ailə",
  },
  {
    slug: "az/ilk-gorusde-ugur-qazanmagin-yollari",
    title: "İlk görüşdə uğur qazanmağın elmi sübut olunmuş yolları",
    description:
      "Bədən dili, aktiv dinləmə və neyropsixoloji taktikalarla ilk görüşü necə unudulmaz etmək olar?",
    icon: Sparkles,
    category: "Araşdırma",
  },
  {
    slug: "az/sevgi-yoxsa-manipulyasiya-gaslighting",
    title: "Sevgi yoxsa manipulyasiya? Gaslighting-i necə tanımaq olar?",
    description:
      "Münasibətdə özünüzdən şübhələnməyə başlamısınız? 'Gaslighting' nədir və ondan necə qorunmaq olar?",
    icon: HeartPulse,
    category: "Psixologiya",
  },
  {
    slug: "az/ilk-mesaji-nece-yazmali",
    title: "İlk mesajı necə yazmalı? Diqqət çəkən başlanğıc",
    description:
      "Tanışlıq tətbiqlərində ilk təəssürat hər şeydir. Söhbəti başlatmaq və marağı qorumaq üçün 5 qızıl qayda.",
    icon: MessageCircle,
    category: "Məsləhətlər",
  },
  {
    slug: "az/ciddi-munasibet-axtararken-edilen-sehvler",
    title: "Ciddi münasibət axtararkən edilən ən böyük səhvlər",
    description:
      "Evlilik və ya ciddi münasibət istəyən həm qadınların, həm də kişilərin yol verdiyi 5 əsas psixoloji səhv.",
    icon: AlertOctagon,
    category: "Psixologiya",
  },
  {
    slug: "az/ideal-profil-sekli-nec-olmalidir",
    title: "İdeal profil şəkli necə olmalıdır?",
    description:
      "Profil şəklinizi seçərkən nələrə diqqət etməli və hansı qeyri-səmimi səhvlərdən qaçmalı olduğunuzu öyrənin.",
    icon: UserCircle,
    category: "Profil",
  },
  {
    slug: "az/tehlukesiz-online-tanisliq",
    title: "Azərbaycanda təhlükəsiz online tanışlıq necə olmalıdır?",
    description:
      "Profil yaratmaqdan ilk mesajlara qədər – təhlükəsiz online tanışlığın əsas qaydaları və praktiki məsləhətlər.",
    icon: BookOpen,
    category: "Təhlükəsizlik",
  },
  {
    slug: "az/tanisliq-tetbiqlerinde-mexfilik",
    title: "Tanışlıq tətbiqlərində məxfilik: nələrə diqqət etməli?",
    description:
      "Foto, ad, lokasiya və şəxsi məlumatlarınızı necə qoruyasınız? Hər kəsin bilməli olduğu məxfilik qaydaları.",
    icon: Shield,
    category: "Məxfilik",
  },
  {
    slug: "az/ilk-gorus-ucun-tehlukesizlik-checklist",
    title: "İlk görüş üçün təhlükəsizlik checklist",
    description:
      "İlk dəfə üz-üzə görüşə gedirsiniz? Addım-addım checklist ilə özünüzü daha güvəndə hiss edin.",
    icon: CheckSquare,
    category: "İlk görüş",
  },
  {
    slug: "az/red-flags-yazismada-riskli-davranislar",
    title: "Red flags: yazışmada riskli davranışlar",
    description:
      "Manipulyasiya, sərhədsizlik və təhlükəli siqnalları vaxtında tanımaq üçün praktik nümunələr.",
    icon: AlertTriangle,
    category: "Red flags",
  },
  {
    slug: "az/saglam-munasibete-aparan-tanisliq-qaydalari",
    title: "Sağlam münasibətə aparan tanışlıq qaydaları",
    description:
      "Hörmətli ünsiyyət, sərhədlər və dəyərlər üzərində qurulan münasibət üçün əsas prinsiplər.",
    icon: HeartHandshake,
    category: "Münasibət",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-5xl mx-auto px-4 py-10 md:py-16">
        <section className="mb-8 md:mb-10 text-center md:text-left">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
            Danyeri Bloq
          </span>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Tanışlıq, Münasibətlər və Psixologiya
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl">
            Səmimi, təhlükəsiz və uğurlu tanışlıq üçün həm kişilərin, həm də qadınların bilməli olduğu faydalı psixologiya sirrləri, ilk görüş bələdçiləri və yazışma qaydaları.
          </p>
        </section>

        <BlogBannerSlider slides={bannerSlides} />

        <section className="grid gap-5 md:gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-border bg-card/60 hover:bg-card transition-colors p-5 md:p-6 flex flex-col h-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <post.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {post.category}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground flex-1">{post.description}</p>
              <div className="mt-4 text-sm font-semibold text-primary inline-flex items-center gap-1">
                Daha ətraflı oxu
                <span aria-hidden>↗</span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

