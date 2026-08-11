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
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {back && (
            <Link
              href="/admin"
              aria-label="Volver"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              <IconChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {right}
      </div>
    </header>
  );
}
