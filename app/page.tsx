import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-tinta text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-end px-6 pt-16 pb-12">
        <p className="text-sm text-white/70">
          San Sebastián de los Reyes Centro
        </p>
        <h1 className="mt-2 font-serif text-[2.75rem] leading-[1.05] tracking-tight">
          Discursos públicos
        </h1>
        <p className="mt-5 max-w-[34ch] font-serif text-[1.0625rem] leading-relaxed text-white/80">
          El calendario de los domingos: quién nos visita, qué bosquejo trae y
          si ya está confirmado.
        </p>

        <div className="mt-10 border-t border-white/15 pt-8">
          <Link
            href="/admin"
            className="flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-tinta transition-colors hover:bg-tinta-suave"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
