import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";
import { AboutPageContent } from "@/components/about/about-page";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("a-propos", {
    title: "À propos | Terminal 3",
    description:
      "L'histoire de Terminal 3, une cave à vin et épicerie fine au cœur de Jérusalem.",
    canonical: "/a-propos",
  });
}

export default async function AboutPage() {
  const [settings, pageContent] = await Promise.all([
    getSiteSettings(),
    getPublishedPageContent("a-propos"),
  ]);

  return <AboutPageContent settings={settings} pageContent={pageContent} />;
}