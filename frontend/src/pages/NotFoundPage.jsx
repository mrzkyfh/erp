import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass rounded-[32px] p-8 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-muted-foreground">URL yang Anda buka tidak tersedia di sistem ini.</p>
        <Link to="/" className="mt-5 inline-flex rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white">
          Kembali ke dashboard
        </Link>
      </div>
    </div>
  );
}
