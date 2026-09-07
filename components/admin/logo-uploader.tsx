"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ImageUploader } from "@/components/admin/image-uploader";
import { setLogoUrl } from "@/app/admin/store/actions";

export function LogoUploader({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleUploaded(newUrl: string) {
    setUrl(newUrl);
    startTransition(async () => {
      try {
        await setLogoUrl(newUrl);
        setMessage("Logo mis à jour sur le site.");
      } catch {
        setMessage("Échec de l'enregistrement.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-sm border border-beige-fonce bg-creme">
        {url ? (
          <Image src={url} alt="Logo Terminal 3" fill sizes="160px" className="object-contain p-2" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-gris-chaud">Logo</div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <ImageUploader bucket="brand-assets" onUploaded={handleUploaded} label="Remplacer le logo" />
        {pending && <span className="text-xs text-gris-chaud">Enregistrement...</span>}
        {message && !pending && <span className="text-xs text-or-principal">{message}</span>}
      </div>
    </div>
  );
}
