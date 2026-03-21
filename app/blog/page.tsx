import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Shield, AlertTriangle, HeartHandshake, CheckSquare } from "lucide-react";
import { BlogBannerSlider } from "@/components/BlogBannerSlider";

export const metadata: Metadata = {
  title: "Təhlükəsiz Tanışlıq Bloqu",
  description:
    "Azərbaycanda təhlükəsiz online tanışlıq, məxfilik, ilk görüş üçün təhlükəsizlik checklist-i, red flag-lər və sağlam münasibət qaydaları haqqında maarifləndirici yazılar.",
  alternates: {
    canonical: "https://www.danyeri.az/blog",
  },
  openGraph: {
    title: "Təhlükəsiz Tanışlıq Bloqu | Danyeri",
    description:
      "Online tanışlıqda təhlükəsizlik, məxfilik və sağlam münasibətlər üçün praktiki məsləhətlər və addım-addım bələdçilər.",
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
    tag: "İlk görüş",
    title: "İlk görüş üçün praktiki checklist",
    description:
      "Məkan seçimi, yaxınlara xəbər vermək və çıxış planı – hamısı addım-addım.",
    href: "/blog/az/ilk-gorus-ucun-tehlukesizlik-checklist",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
  },
  {
    tag: "Red flags",
    title: "Yazışmada təhlükəli siqnalları tanıyın",
    description:
      "Manipulyasiya, hörmətsizlik və sərhəd pozuntularını erkən mərhələdə görməyi öyrənin.",
    href: "/blog/az/red-flags-yazismada-riskli-davranislar",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
  },
];

const posts = [
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
            Təhlükəsiz tanışlıq bloqu
          </span>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Təhlükəsiz online tanışlıq və münasibətlər üçün bələdçi
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl">
            Burada məqsədimiz, xüsusilə qadınlar üçün, online tanışlıqda təhlükəsizlik,
            məxfilik və sağlam münasibətlər mövzusunda qısa, praktik və real həyatdan
            gələn məsləhətlər paylaşmaqdır.
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

