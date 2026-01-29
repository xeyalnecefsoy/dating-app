import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { MainLayout } from "@/components/MainLayout";

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
  title: "Danyeri - Dating App",
  description: "Sevgi və münasibətlər üçün tətbiq. Find your perfect match with Danyeri.",
  manifest: "/manifest.json",
  keywords: ["dating", "relationships", "azerbaijan", "values", "connection", "tanışlıq", "sevgi"],
  applicationName: "Danyeri",
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
    siteName: "Danyeri",
    title: "Danyeri - Dating App",
    description: "Sevgi və münasibətlər üçün tətbiq",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
           <MainLayout>
             {children}
           </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
