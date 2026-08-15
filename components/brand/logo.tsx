import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

export function Logo({
  settings,
  className,
}: {
  settings: SiteSettings;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`block transition-transform duration-300 ease-out hover:scale-[1.02] ${className ?? ""}`}
      aria-label={`${settings.STORE_NAME} — accueil`}
    >
      <div className="relative h-[clamp(48px,3.6vw,58px)] w-[clamp(108px,7vw,138px)] flex items-center justify-center [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.35))]">
        <Image
          src={settings.LOGO_URL}
          alt={settings.STORE_NAME}
          fill
          unoptimized
          priority
          className="object-contain object-center"
          sizes="(max-width: 640px) 120px, (max-width: 1024px) 130px, 150px"
        />
      </div>
    </Link>
  );
}
