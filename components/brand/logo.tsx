import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

/**
 * The ONLY place that renders the Terminal 3 logo. To replace the
 * placeholder with the real asset, either:
 *   1. Set `site_settings.LOGO_URL` in the database (no redeploy), or
 *   2. Replace `/public/logo-placeholder.svg` with the real file and keep
 *      the same path, or
 *   3. Update `DEFAULT_BUSINESS_CONFIG.LOGO_URL` in `lib/config.ts`.
 * No layout code needs to change.
 */
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
      className={className}
      aria-label={`${settings.STORE_NAME} — accueil`}
    >
      <div className="relative group">
        {/* Ambient glow effect */}
        <div className="absolute inset-0 bg-champagne/10 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Subtle shadow for depth */}
        <div className="absolute inset-0 bg-black/20 blur-sm rounded-full" />
        
        {/* Logo image with premium styling */}
        <Image
          src={settings.LOGO_URL}
          alt={settings.STORE_NAME}
          width={800}
          height={200}
          priority
          className="relative h-20 w-auto sm:h-24 lg:h-28 transition-transform duration-500 group-hover:scale-105 drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(197, 163, 90, 0.1))',
          }}
        />
        
        {/* Subtle gold border on hover */}
        <div className="absolute inset-0 rounded-full border border-champagne/0 group-hover:border-champagne/30 transition-all duration-500" />
      </div>
    </Link>
  );
}
