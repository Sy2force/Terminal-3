import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings, isStoreOnline } from "@/lib/settings";
import { CartProvider } from "@/lib/cart/cart-context";

const editorialSerif = Playfair_Display({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const editorialSans = Inter({
  variable: "--font-editorial-sans",
  subsets: ["latin"],
});
// NOTE: Hebrew is not in Inter's Google Fonts subsets. When Hebrew/RTL
// locale support is implemented (see spec section 37), load a Hebrew-
// capable sans (e.g. Noto Sans Hebrew) as a second `--font-editorial-sans`
// value applied only under `[dir="rtl"]`, rather than faking RTL with CSS.

export const metadata: Metadata = {
  title: "Terminal 3 | Jerusalem",
  description:
    "Terminal 3 — cave à vin, whisky et épicerie fine à Jérusalem. Vins, whiskies, saumon fumé, charcuterie et sélections exclusives.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  openGraph: {
    title: "Terminal 3 | Jerusalem",
    description:
      "Vins, whiskies, saumon fumé, charcuterie et sélections exclusives — Agripas 105, Jérusalem.",
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, storeOnline] = await Promise.all([
    getSiteSettings(),
    isStoreOnline(),
  ]);

  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${editorialSerif.variable} ${editorialSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-obsidian text-ivory">
        <CartProvider>
          <Navbar settings={settings} storeOnline={storeOnline} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
