"use client";

import { useEffect, useMemo, useState } from "react";
import {
  obtenerDiscursos,
  type Discurso,
  type Discursante,
} from "../../../lib/api";
import PageHeader from "../_components/PageHeader";
import SearchInput from "../_components/SearchInput";
import { EstadoEtiqueta } from "../_components/Estado";
import { textoError } from "../_components/estilos";

type Vista = "fecha" | "discursante";

function aFecha(fecha: string) {
  return new Date(fecha.slice(0, 10) + "T00:00:00");
}

function etiquetaMes(fecha: string) {
  return aFecha(fecha).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

function fechaCorta(fecha: string) {
  return aFecha(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function coincide(d: Discurso, busqueda: string) {
  if (!busqueda) return true;
  const campos = [
    d.discursante?.nombre,
    d.discursante?.congregacionOrigen,
    d.bosquejo?.titulo,
    d.bosquejoNumero?.toString(),
  ];
  return campos.some((c) => c && normalizar(c).includes(busqueda));
}

function TextoBosquejo({ d }: { d: Discurso }) {
  return (
    <>
      {d.bosquejo?.titulo ?? (d.bosquejoNumero ? "" : "Sin bosquejo")}
      {d.bosquejoNumero ? (
        <span className="ml-2 font-sans text-xs text-apagado/80">
          n.º {d.bosquejoNumero}
        </span>
      ) : null}
    </>
  );
}

export default function HistoricoPage() {
  const [discursos, setDiscursos] = useState<Discurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>("fecha");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    obtenerDiscursos()
      .then((data) => setDiscursos(data))
      .catch(() => setError("No se pudieron cargar los discursos"))
      .finally(() => setCargando(false));
  }, []);

  // Discursos anteriores a hoy, del más reciente al más antiguo
  const pasados = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return discursos
      .filter((d) => aFecha(d.fecha) < hoy)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [discursos]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return pasados.filter((d) => coincide(d, q));
  }, [pasados, busqueda]);

  // Vista por fecha: agrupados por mes
  const porMes = useMemo(() => {
    const grupos: { mes: string; items: Discurso[] }[] = [];
    for (const d of filtrados) {
      const mes = etiquetaMes(d.fecha);
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.mes === mes) ultimo.items.push(d);
      else grupos.push({ mes, items: [d] });
    }
    return grupos;
  }, [filtrados]);

  // Vista por discursante: sus discursos pasados, ordenados por la visita más reciente
  const porDiscursante = useMemo(() => {
    const mapa = new Map<
      number,
      { discursante: Discursante; items: Discurso[] }
    >();
    for (const d of filtrados) {
      if (!d.discursante) continue;
      const entrada = mapa.get(d.discursante.id);
      if (entrada) entrada.items.push(d);
      else mapa.set(d.discursante.id, { discursante: d.discursante, items: [d] });
    }
    return [...mapa.values()].sort((a, b) =>
      b.items[0].fecha.localeCompare(a.items[0].fecha),
    );
  }, [filtrados]);

  if (cargando || error) {
    return (
      <main>
        <PageHeader title="Histórico" />
        <p className={`mt-20 px-6 text-center ${error ? textoError : "text-sm text-apagado"}`}>
          {error ?? "Cargando histórico…"}
        </p>
      </main>
    );
  }

  const botonVista = (valor: Vista, texto: string) => (
    <button
      onClick={() => setVista(valor)}
      aria-pressed={vista === valor}
      className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
        vista === valor
          ? "bg-tinta text-white"
          : "text-apagado hover:text-tinta"
      }`}
    >
      {texto}
    </button>
  );

  return (
    <main className="pb-10">
      <PageHeader
        title="Histórico"
        subtitle={`${pasados.length} discursos pasados`}
      />

      <div className="mx-auto max-w-md px-5">
        <div className="mt-5 flex gap-1 rounded-full border border-linea bg-white p-1">
          {botonVista("fecha", "Por fecha")}
          {botonVista("discursante", "Por discursante")}
        </div>
        <div className="mt-3">
          <SearchInput
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar nombre o bosquejo"
          />
        </div>

        {filtrados.length === 0 && (
          <p className="mt-10 text-center text-sm text-apagado">
            {pasados.length === 0
              ? "Todavía no hay discursos pasados."
              : "Ningún discurso coincide con esa búsqueda."}
          </p>
        )}

        {vista === "fecha" &&
          porMes.map(({ mes, items }) => (
            <section key={mes} className="mt-8">
              <h2 className="font-serif text-lg first-letter:uppercase text-texto">
                {mes}
              </h2>
              <ul className="mt-2 divide-y divide-linea border-y border-linea">
                {items.map((d) => (
                  <li key={d.id} className="flex items-start gap-4 py-4">
                    <p className="w-9 shrink-0 pt-0.5 text-center font-serif text-2xl leading-none text-tinta">
                      {aFecha(d.fecha).getDate()}
                    </p>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-texto">
                        {d.discursante?.nombre ?? (
                          <span className="text-apagado">Sin asignar</span>
                        )}
                      </p>
                      {d.discursante?.congregacionOrigen && (
                        <p className="text-xs text-apagado">
                          Congregación {d.discursante.congregacionOrigen}
                        </p>
                      )}
                      <p className="mt-1 font-serif text-sm leading-snug text-apagado">
                        <TextoBosquejo d={d} />
                      </p>
                      {d.notas && (
                        <p className="mt-1 break-words text-xs text-apagado/80">
                          {d.notas}
                        </p>
                      )}
                    </div>
                    <EstadoEtiqueta estado={d.estado} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

        {vista === "discursante" && porDiscursante.length > 0 && (
          <ul className="mt-6 divide-y divide-linea border-y border-linea">
            {porDiscursante.map(({ discursante, items }) => (
              <li key={discursante.id}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <p className="font-serif text-[1.05rem] text-texto">
                        {discursante.nombre}
                      </p>
                      {discursante.congregacionOrigen && (
                        <p className="text-xs text-apagado">
                          Congregación {discursante.congregacionOrigen}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-tinta">
                        Última visita: {fechaCorta(items[0].fecha)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-apagado">
                        {items.length} {items.length === 1 ? "discurso" : "discursos"}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-apagado transition-transform group-open:rotate-180"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </summary>
                  <ul className="mb-4 space-y-3 border-l-2 border-tinta-suave pl-4">
                    {items.map((d) => (
                      <li key={d.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-apagado">{fechaCorta(d.fecha)}</p>
                          <p className="font-serif text-sm leading-snug text-texto">
                            <TextoBosquejo d={d} />
                          </p>
                        </div>
                        <EstadoEtiqueta estado={d.estado} />
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
