import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MixpanelInitializer from "./MixpanelInitializer";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://present.orately.ai"),
  title: "Present — by Orately AI",
  description:
    "Erstelle hochwertige KI-Präsentationen mit Gemini. Automatische Bildgenerierung, professionelle Templates und sofortiger Export als PPTX oder PDF.",
  keywords: [
    "KI-Präsentation",
    "Präsentationsgenerator",
    "Gemini AI",
    "Orately",
    "Präsentation erstellen",
    "AI presentation generator",
    "PPTX export",
    "Schulpräsentation",
  ],
  openGraph: {
    title: "Present — by Orately AI",
    description:
      "Erstelle hochwertige KI-Präsentationen mit Gemini. Automatische Bildgenerierung, professionelle Templates und sofortiger Export.",
    url: "https://present.orately.ai",
    siteName: "Present by Orately AI",
    type: "website",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Present — by Orately AI",
    description:
      "Erstelle hochwertige KI-Präsentationen mit Gemini. Automatische Bildgenerierung, professionelle Templates und sofortiger Export.",
  },
  icons: {
    icon: [
      { url: "/orately-glyph.svg", type: "image/svg+xml" },
    ],
    apple: "/orately-glyph.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`} style={{ fontFamily: "var(--font-poppins, 'Poppins'), system-ui, sans-serif" }}>
        <Providers>
          <MixpanelInitializer>
            {children}
          </MixpanelInitializer>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
