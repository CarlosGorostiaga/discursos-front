import Link from "next/link";
import type { ReactNode } from "react";

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function PageHeader({
  title,
  subtitle,
  back = true,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 bg-tinta text-white">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <Link
              href="/admin"
              aria-label="Volver"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:bg-white/25 transition-colors"
            >
              <IconChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="font-serif text-xl truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-white/70 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {right}
      </div>
    </header>
  );
}
