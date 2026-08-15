import { CompteSidebar } from "@/components/account/compte-sidebar";

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian">
      <div className="mx-auto flex max-w-7xl flex-col gap-0 lg:flex-row lg:gap-8 lg:px-8">
        <CompteSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
