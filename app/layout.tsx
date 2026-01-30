import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { MainLayout } from "@/components/MainLayout";
import { StructuredData } from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://danyeri.az"),
  title: {
    default: "Danyeri - Azərbaycanda Ciddi Tanışlıq və Evlilik Tətbiqi",
    template: "%s | Danyeri",
  },
  description: "Azərbaycanda ən etibarlı tanışlıq tətbiqi. Ciddi münasibət və evlilik üçün Bakı, Sumqayıt, Gəncə və digər şəhərlərdə həyat yoldaşınızı tapın. Pulsuz qeydiyyat!",
  manifest: "/manifest.json",
  keywords: [
    "tanışlıq tətbiqi",
    "Azərbaycanda tanışlıq",
    "evlilik üçün tanışlıq",
    "Bakıda tanışlıq",
    "ciddi münasibət",
    "həyat yoldaşı tapmaq",
    "azərbaycanlı qızlarla tanışlıq",
    "evlənmək istəyirəm",
    "Sumqayıtda tanışlıq",
    "Gəncədə tanışlıq",
    "dating app azerbaijan",
    "danyeri",
  ],
  applicationName: "Danyeri",
  authors: [{ name: "Danyeri" }],
  creator: "Danyeri",
  publisher: "Danyeri",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Danyeri",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: "https://danyeri.az",
    siteName: "Danyeri",
    title: "Danyeri - Azərbaycanda Ciddi Tanışlıq və Evlilik",
    description: "Həyat yoldaşınızı Danyeri-də tapın! Azərbaycanda ən etibarlı tanışlıq tətbiqi.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Danyeri - Azərbaycan Tanışlıq Tətbiqi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Danyeri - Azərbaycanda Ciddi Tanışlıq",
    description: "Həyat yoldaşınızı Danyeri-də tapın!",
    images: ["/og-image.jpg"],
    creator: "@danyeri_az",
  },
  alternates: {
    canonical: "https://danyeri.az",
    languages: {
      "az-AZ": "https://danyeri.az",
      "en-US": "https://danyeri.az/en",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/logo.jpg", sizes: "any", type: "image/jpeg" },
    ],
    shortcut: ["/logo.jpg"],
    apple: [
      { url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF4458" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0F" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
           <StructuredData />
           <MainLayout>
             {children}
           </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
