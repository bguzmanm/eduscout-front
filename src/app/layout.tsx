import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import RibbonBadge from "@/components/RibbonBadge";
import Footer from "@/components/Footer";
import AttributionTracker from "@/components/AttributionTracker";
import { SavedJobsProvider } from "@/components/SavedJobsProvider";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

// Las fuentes se empaquetan en src/app/fonts para que el build no dependa de
// descargarlas de Google (fallaba de forma intermitente en CI/Docker).
const display = localFont({
  src: "./fonts/sen-latin.woff2",
  variable: "--font-display",
  weight: "500 800",
  display: "swap",
});

const body = localFont({
  src: "./fonts/work-sans-latin.woff2",
  variable: "--font-sans",
  weight: "400 600",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-mono",
  weight: "400 500",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "trabajo docentes",
    "ofertas académicas",
    "cargos docentes Chile",
    "empleo educación superior",
    "concursos académicos",
    "universidades Chile",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable}`}
      >
        <div className="flex flex-col min-h-screen">
          <AttributionTracker />
          <RibbonBadge />
          <Navbar />
          <main className="flex-grow">
            <SavedJobsProvider>{children}</SavedJobsProvider>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
