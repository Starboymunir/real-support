import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen hero-dark dot-grid flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-white/40 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-secondary text-dark font-bold px-8 py-3.5 rounded-xl hover:shadow-[0_8px_30px_rgba(0,230,118,0.35)] hover:-translate-y-0.5 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
