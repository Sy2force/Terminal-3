import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { getPublishedPageContent, buildPageMetadata } from "@/lib/data/page-contents";
import { ContactPageContent } from "@/components/contact/contact-page";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact", {
    title: "Contact | Terminal 3",
    description: "Nous sommes à votre écoute pour toute question ou suggestion.",
    canonical: "/contact",
  });
}

export default async function ContactPage() {
  const [settings, pageContent] = await Promise.all([
    getSiteSettings(),
    getPublishedPageContent("contact"),
  ]);

  return <ContactPageContent settings={settings} pageContent={pageContent} />;
}