"use client";

import { useEffect, useMemo, useState } from "react";
import {
  obtenerDiscursos,
  type Discurso,
  type Discursante,
  type EstadoDiscurso,
} from "../../../lib/api";
import { formatearFecha } from "../../../lib/fechas";
import PageHeader from "../_components/PageHeader";
import SearchInput from "../_components/SearchInput";

type Vista = "fecha" | "discursante";

const estilosEstado: Record<EstadoDiscurso, string> = {
  pendiente: "bg-gray-100 text-gray-600",
  enviado: "bg-blue-100 text-blue-700",
  confirmado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
};

const etiquetasEstado: Record<EstadoDiscurso, string> = {
  pendiente: "Pendiente",
  enviado: "Enviado",
  confirmado: "Confirmado",
  rechazado: "Rechazado",
};

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

function EstadoBadge({ estado }: { estado: EstadoDiscurso }) {
  return (
    <span
      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${estilosEstado[estado]}`}
    >
      {etiquetasEstado[estado]}
    </span>
  );
}

function TextoBosquejo({ d }: { d: Discurso }) {
  return (
    <>
      {d.bosquejoNumero ? `Bosquejo ${d.bosquejoNumero}` : "Sin bosquejo"}
      {d.bosquejo?.titulo ? ` · ${d.bosquejo.titulo}` : ""}
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

  if (cargando) {
    return (
      <main className="flex items-center justify-center py-24">
        <p className="text-gray-500 text-sm">Cargando histórico…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center py-24">
        <p className="text-red-500 text-sm">{error}</p>
      </main>
    );
  }

  const botonVista = (valor: Vista, texto: string) => (
    <button
      onClick={() => setVista(valor)}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
        vista === valor
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
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

      <div className="px-4 mt-4 space-y-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {botonVista("fecha", "Por fecha")}
          {botonVista("discursante", "Por discursante")}
        </div>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar nombre, congregación o bosquejo"
        />
      </div>

      {filtrados.length === 0 && (
        <p className="text-sm text-gray-500 text-center mt-10">
          {pasados.length === 0
            ? "Todavía no hay discursos pasados"
            : "No hay resultados para esa búsqueda"}
        </p>
      )}

      {vista === "fecha" &&
        porMes.map(({ mes, items }) => (
          <section key={mes} className="px-4 mt-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              {mes}
            </h2>
            <div className="space-y-2">
              {items.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 capitalize">
                      {formatearFecha(d.fecha)}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {d.discursante?.nombre ?? "Sin asignar"}
                    </p>
                    {d.discursante?.congregacionOrigen && (
                      <p className="text-xs text-gray-500">
                        {d.discursante.congregacionOrigen}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      <TextoBosquejo d={d} />
                    </p>
                    {d.notas && (
                      <p className="text-xs text-gray-400 mt-1 break-words">
                        {d.notas}
                      </p>
                    )}
                  </div>
                  <EstadoBadge estado={d.estado} />
                </div>
              ))}
            </div>
          </section>
        ))}

      {vista === "discursante" && porDiscursante.length > 0 && (
        <div className="px-4 mt-4 space-y-2">
          {porDiscursante.map(({ discursante, items }) => (
            <details
              key={discursante.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <summary className="list-none cursor-pointer p-3.5 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {discursante.nombre}
                  </p>
                  {discursante.congregacionOrigen && (
                    <p className="text-xs text-gray-500">
                      {discursante.congregacionOrigen}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-0.5">
                    Último: {fechaCorta(items[0].fecha)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {items.length} {items.length === 1 ? "discurso" : "discursos"}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </summary>
              <ul className="border-t border-gray-100 px-3.5 py-2 space-y-2">
                {items.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        {fechaCorta(d.fecha)}
                      </p>
                      <p className="text-sm text-gray-800">
                        <TextoBosquejo d={d} />
                      </p>
                    </div>
                    <EstadoBadge estado={d.estado} />
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </main>
  );
}
