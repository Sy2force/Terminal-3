import { requireAdminPermission } from "@/lib/admin/auth";
import { getThemeAction } from "./actions";
import { ThemeEditor } from "@/components/admin/theme-editor";

export default async function AppearancePage() {
  await requireAdminPermission("store.settings");
  const theme = await getThemeAction();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-serif text-2xl text-ivory">Apparence</h1>
      <p className="mt-1 text-sm text-muted-grey">
        Couleurs, polices et espacement du site. Les changements sont publiés immédiatement.
      </p>
      <div className="mt-8">
        <ThemeEditor initial={theme} />
      </div>
    </div>
  );
}
