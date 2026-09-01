import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getSiteSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { getAdminSession } from "@/lib/admin/auth";
import { getPublishedTheme, themeToCssVars } from "@/lib/data/theme";
import { getPublishedMenu } from "@/lib/data/navigation";
import { CartProvider } from "@/lib/cart/cart-context";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { AdminEditModeProvider } from "@/components/admin/admin-edit-mode";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { WoltSettingsProvider } from "@/components/commerce/wolt-settings-provider";
import { IntroSplash } from "@/components/intro/intro-splash";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

const editorialSerif = Cormorant_Garamond({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const editorialSans = Manrope({
  variable: "--font-editorial-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
// NOTE: Hebrew is not in Inter's Google Fonts subsets. When Hebrew/RTL
// locale support is implemented (see spec section 37), load a Hebrew-
// capable sans (e.g. Noto Sans Hebrew) as a second `--font-editorial-sans`
// value applied only under `[dir="rtl"]`, rather than faking RTL with CSS.

export const metadata: Metadata = {
  manifest: "/site.webmanifest",
  title: "Terminal 3 | Cave à vin et épicerie fine à Jérusalem",
  description:
    "Terminal 3 — cave à vin, whisky et épicerie fine à Jérusalem. Vins, whiskies, saumon fumé, charcuterie et sélections exclusives.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  icons: {
    icon: "/images/terminal-3/brand/favicon/favicon-32x32.png",
    shortcut: "/images/terminal-3/brand/favicon/favicon-32x32.png",
    apple: "/images/terminal-3/brand/favicon/apple-touch-icon-180x180.png",
  },
  openGraph: {
    title: "Terminal 3 | Cave à vin et épicerie fine à Jérusalem",
    description:
      "Vins, whiskies, saumon fumé, charcuterie et sélections exclusives — Jérusalem.",
    type: "website",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const [settings, user, adminSession, theme, mainMenu, footerMenu] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getAdminSession(),
    getPublishedTheme(),
    getPublishedMenu("main"),
    getPublishedMenu("footer"),
  ]);

  const cssVars = themeToCssVars(theme);

  return (
    <html
      lang="fr"
      dir="ltr"
      data-scroll-behavior="smooth"
      className={`${editorialSerif.variable} ${editorialSans.variable} h-full antialiased`}
      style={cssVars}
    >
      <body className="min-h-full flex flex-col bg-noir-profond text-texte-clair">
        <CartProvider>
          <RegisterServiceWorker />
          <IntroSplash />
          <AdminEditModeProvider session={adminSession}>
            <WoltSettingsProvider enabled={settings.WOLT_ENABLED} storeUrl={settings.WOLT_STORE_URL}>
              {settings.PRESENCE_TRACKING_ENABLED && <PresenceHeartbeat />}
              <AnnouncementBar />
              <Navbar
                settings={settings}
                user={user}
                isAdmin={!!adminSession}
                mainMenu={mainMenu}
              />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer settings={settings} footerMenu={footerMenu} />
              <ScrollToTop />
              <BottomNav isAdmin={!!adminSession} />
            </WoltSettingsProvider>
          </AdminEditModeProvider>
        </CartProvider>
      </body>
    </html>
  );
}
