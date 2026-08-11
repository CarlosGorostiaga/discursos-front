"use client";

import { useEffect, useState } from "react";
import {
  obtenerDiscursos,
  obtenerDiscursantes,
  obtenerBosquejos,
  asignarDiscursoData,
  crearDiscurso,
  eliminarDiscurso,
  intercambiarDiscursos,
  actualizarNotasDiscurso,
  type Discurso,
  type Discursante,
  type Bosquejo,
} from "../../../lib/api";
import { formatearFecha } from "../../../lib/fechas";
import PageHeader from "../_components/PageHeader";

function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 6h16" />
      <path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" />
      <path d="M6 6l1 14.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconSwap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 8h13" />
      <path d="M13 4l4 4-4 4" />
      <path d="M20 16H7" />
      <path d="M11 12l-4 4 4 4" />
    </svg>
  );
}

export default function DiscursosPage() {
  const [discursos, setDiscursos] = useState<Discurso[]>([]);
  const [discursantes, setDiscursantes] = useState<Discursante[]>([]);
  const [bosquejos, setBosquejos] = useState<Bosquejo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const [intercambiandoId, setIntercambiandoId] = useState<number | null>(
    null,
  );
  const [destinoIntercambio, setDestinoIntercambio] = useState("");
  const [guardandoIntercambio, setGuardandoIntercambio] = useState(false);

  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState({
    fecha: "",
    discursanteId: "",
    bosquejoNumero: "",
  });

  useEffect(() => {
    Promise.all([obtenerDiscursos(), obtenerDiscursantes(), obtenerBosquejos()])
      .then(([d, ds, b]) => {
        setDiscursos(d);
        setDiscursantes(ds);
        setBosquejos(b);
      })
      .catch(() => setError("No se pudieron cargar los datos"))
      .finally(() => setCargando(false));
  }, []);

  async function asignar(
    id: number,
    data: { discursanteId?: number | null; bosquejoNumero?: number | null },
  ) {
    setGuardandoId(id);
    setDiscursos((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const discursante =
          data.discursanteId !== undefined
            ? (discursantes.find((x) => x.id === data.discursanteId) ?? null)
            : d.discursante;
        const bosquejo =
          data.bosquejoNumero !== undefined
            ? (bosquejos.find((x) => x.numero === data.bosquejoNumero) ?? null)
            : d.bosquejo;
        return { ...d, ...data, discursante, bosquejo };
      }),
    );
    try {
      await asignarDiscursoData(id, data);
    } catch {
      setError("No se pudo guardar la asignación");
    } finally {
      setGuardandoId(null);
    }
  }

  async function crearNuevo() {
    if (!nuevo.fecha) return;
    setCreando(true);
    try {
      const creado = await crearDiscurso({
        fecha: nuevo.fecha,
        discursanteId: nuevo.discursanteId ? Number(nuevo.discursanteId) : null,
        bosquejoNumero: nuevo.bosquejoNumero
          ? Number(nuevo.bosquejoNumero)
          : null,
      });
      setDiscursos((prev) => [...prev, creado]);
      setNuevo({ fecha: "", discursanteId: "", bosquejoNumero: "" });
      setMostrarNuevo(false);
    } catch {
      setError("No se pudo crear el discurso");
    } finally {
      setCreando(false);
    }
  }

  async function confirmarIntercambio(idA: number) {
    const idB = Number(destinoIntercambio);
    if (!idB) return;
    setGuardandoIntercambio(true);
    try {
      const { a, b } = await intercambiarDiscursos(idA, idB);
      setDiscursos((prev) =>
        prev.map((d) => (d.id === a.id ? a : d.id === b.id ? b : d)),
      );
      setIntercambiandoId(null);
      setDestinoIntercambio("");
    } catch {
      setError("No se pudo intercambiar");
    } finally {
      setGuardandoIntercambio(false);
    }
  }

  function cambiarNotas(id: number, notas: string) {
    setDiscursos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, notas } : d)),
    );
  }

  async function guardarNotas(id: number, notas: string) {
    try {
      await actualizarNotasDiscurso(id, notas);
    } catch {
      setError("No se pudo guardar la nota");
    }
  }

  async function eliminar(d: Discurso) {
    const nombre = d.discursante?.nombre ?? "sin discursante";
    const confirmado = window.confirm(
      `¿Eliminar el discurso del ${formatearFecha(d.fecha)} (${nombre})? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    setEliminandoId(d.id);
    try {
      await eliminarDiscurso(d.id);
      setDiscursos((prev) => prev.filter((x) => x.id !== d.id));
    } catch {
      setError("No se pudo eliminar el discurso");
    } finally {
      setEliminandoId(null);
    }
  }

  if (cargando) {
    return (
      <main className="flex items-center justify-center py-24">
        <p className="text-gray-500 text-sm">Cargando…</p>
      </main>
    );
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximos = discursos
    .filter((d) => new Date(d.fecha.slice(0, 10) + "T00:00:00") >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const campoClase =
    "w-full min-w-0 border border-gray-200 rounded-xl px-2.5 py-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors";

  return (
    <main className="pb-10">
      <PageHeader
        title="Asignar discursos"
        subtitle="Elige discursante y bosquejo para cada día"
        right={
          <button
            onClick={() => setMostrarNuevo(!mostrarNuevo)}
            className="shrink-0 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-full shadow-sm shadow-blue-200 transition-colors"
          >
            + Nuevo
          </button>
        }
      />

      {error && (
        <p className="text-red-500 text-sm text-center mt-4">{error}</p>
      )}

      {mostrarNuevo && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            <input
              type="date"
              value={nuevo.fecha}
              onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })}
              className={campoClase}
            />
            <select
              value={nuevo.discursanteId}
              onChange={(e) =>
                setNuevo({ ...nuevo, discursanteId: e.target.value })
              }
              className={campoClase}
            >
              <option value="">Sin asignar</option>
              {discursantes.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.nombre}
                </option>
              ))}
            </select>
            <select
              value={nuevo.bosquejoNumero}
              onChange={(e) =>
                setNuevo({ ...nuevo, bosquejoNumero: e.target.value })
              }
              className={campoClase}
            >
              <option value="">Sin bosquejo</option>
              {bosquejos.map((b) => (
                <option key={b.numero} value={b.numero}>
                  {b.numero} · {b.titulo}
                </option>
              ))}
            </select>
            <button
              onClick={crearNuevo}
              disabled={!nuevo.fecha || creando}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              {creando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <div className="px-4 mt-4 space-y-2">
        {proximos.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-600 font-medium capitalize">
                {formatearFecha(d.fecha)}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setDestinoIntercambio("");
                    setIntercambiandoId(
                      intercambiandoId === d.id ? null : d.id,
                    );
                  }}
                  aria-label="Intercambiar discurso"
                  className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    intercambiandoId === d.id
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <IconSwap className="w-4 h-4" />
                </button>
                <button
                  onClick={() => eliminar(d)}
                  disabled={eliminandoId === d.id}
                  aria-label="Eliminar discurso"
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            </div>

            {intercambiandoId === d.id && (
              <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
                <p className="text-xs text-blue-700">
                  Intercambia discursante y bosquejo con otro día (ambos
                  quedarán en estado &ldquo;pendiente&rdquo;).
                </p>
                <select
                  value={destinoIntercambio}
                  onChange={(e) => setDestinoIntercambio(e.target.value)}
                  className={campoClase}
                >
                  <option value="">Selecciona un discurso…</option>
                  {proximos
                    .filter((x) => x.id !== d.id)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {formatearFecha(x.fecha)} ·{" "}
                        {x.discursante?.nombre ?? "Sin asignar"}
                      </option>
                    ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmarIntercambio(d.id)}
                    disabled={!destinoIntercambio || guardandoIntercambio}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                  >
                    {guardandoIntercambio ? "Intercambiando…" : "Confirmar"}
                  </button>
                  <button
                    onClick={() => {
                      setIntercambiandoId(null);
                      setDestinoIntercambio("");
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <select
                value={d.discursanteId ?? ""}
                disabled={guardandoId === d.id}
                onChange={(e) =>
                  asignar(d.id, {
                    discursanteId: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className={`sm:flex-1 ${campoClase}`}
              >
                <option value="">Sin asignar</option>
                {discursantes.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.nombre}
                  </option>
                ))}
              </select>
              <select
                value={d.bosquejoNumero ?? ""}
                disabled={guardandoId === d.id}
                onChange={(e) =>
                  asignar(d.id, {
                    bosquejoNumero: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className={`sm:flex-1 ${campoClase}`}
              >
                <option value="">Sin bosquejo</option>
                {bosquejos.map((b) => (
                  <option key={b.numero} value={b.numero}>
                    {b.numero} · {b.titulo}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={d.notas ?? ""}
              onChange={(e) => cambiarNotas(d.id, e.target.value)}
              onBlur={(e) => guardarNotas(d.id, e.target.value)}
              placeholder="Notas (canción, imagen…)"
              className={`mt-2 ${campoClase}`}
            />
          </div>
        ))}
        {proximos.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-6">
            No hay próximos discursos
          </p>
        )}
      </div>
    </main>
  );
}
