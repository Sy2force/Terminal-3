import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface AccordionSection {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

export function WineInfoAccordion({ sections }: { sections: AccordionSection[] }) {
  const visible = sections.filter((s) => s.content != null);
  if (visible.length === 0) return null;

  return (
    <div className="divide-y divide-brun-cave/15 border-y border-brun-cave/15">
      {visible.map((section) => (
        <details key={section.id} open={section.defaultOpen} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux-principal">
            <span className="font-serif text-lg text-noir-profond">{section.title}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 text-bordeaux-principal transition-transform duration-200 group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="pt-4">{section.content}</div>
        </details>
      ))}
    </div>
  );
}

export type { AccordionSection };
