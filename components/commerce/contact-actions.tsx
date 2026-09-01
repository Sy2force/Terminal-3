import { Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

function buildWhatsAppMessage(params?: {
  productName?: string;
  variantLabel?: string;
  promoPriceLabel?: string;
}) {
  const lines = ["Bonjour Terminal 3"];
  if (params?.productName) {
    lines.push("Je suis intéressé par :", params.productName);
    if (params.variantLabel) lines.push(params.variantLabel);
    if (params.promoPriceLabel) lines.push(params.promoPriceLabel);
  }
  return encodeURIComponent(lines.join("\n"));
}

export function WhatsAppButton({
  whatsapp,
  productName,
  variantLabel,
  promoPriceLabel,
  className,
  children = "WhatsApp",
}: {
  whatsapp: string;
  productName?: string;
  variantLabel?: string;
  promoPriceLabel?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const normalized = normalizeWhatsAppNumber(whatsapp);
  if (!normalized) return null;
  const digits = normalized.replace(/^\+/, "");
  const href = `https://wa.me/${digits}?text=${buildWhatsAppMessage(
    { productName, variantLabel, promoPriceLabel },
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-event="whatsapp_store"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-champagne/40 px-4 py-2 text-sm font-medium text-ivory transition-colors hover:border-champagne hover:text-champagne",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      {children}
    </a>
  );
}

export function CallButton({
  phone,
  className,
  children = "Appeler",
}: {
  phone: string;
  className?: string;
  children?: React.ReactNode;
}) {
  if (!phone) return null;
  return (
    <a
      href={`tel:${phone}`}
      data-analytics-event="call_store"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-champagne/40 px-4 py-2 text-sm font-medium text-ivory transition-colors hover:border-champagne hover:text-champagne",
        className,
      )}
    >
      <Phone className="h-4 w-4" aria-hidden />
      {children}
    </a>
  );
}
