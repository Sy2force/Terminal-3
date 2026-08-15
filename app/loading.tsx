export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-fond-papier px-6 py-24" role="status" aria-live="polite" aria-label="Chargement en cours">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-or-principal/20 border-t-or-principal" aria-hidden />
        <p className="mt-4 text-sm uppercase tracking-widest text-gris-chaud">Chargement…</p>
      </div>
    </div>
  );
}
