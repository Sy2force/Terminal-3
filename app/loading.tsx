export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#151411]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#C6A15B] border-t-transparent" />
        <p className="text-sm text-[#71695F]">Chargement…</p>
      </div>
    </div>
  );
}
