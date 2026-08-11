import Link from "next/link";

function IconMic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
      <path d="M8.5 21h7" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-linear-to-b from-slate-50 via-white to-blue-50 px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200">
          <IconMic className="h-8 w-8 text-white" />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-blue-600">
          San Sebastián de los Reyes Centro
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
          Control de discursos
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Discursantes, bosquejos y el calendario de discursos públicos de la
          congregación, todo en un mismo sitio.
        </p>

        <Link
          href="/admin"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3.5 text-sm font-medium text-white shadow-md shadow-blue-200 transition-colors hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800"
        >
          Administrar
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
