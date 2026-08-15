import { getSiteSettings } from "@/lib/settings";
import { DEFAULT_ANNOUNCEMENT_TEXT } from "@/lib/config";

export async function AnnouncementBar() {
  const settings = await getSiteSettings();
  const announcementText = settings.ANNOUNCEMENT_TEXT || DEFAULT_ANNOUNCEMENT_TEXT;

  return (
    <div className="h-8 flex items-center justify-center border-b border-or-principal/20 bg-noir-profond">
      <p className="text-[11px] uppercase tracking-[0.25em] text-or-principal font-medium">
        {announcementText}
      </p>
    </div>
  );
}