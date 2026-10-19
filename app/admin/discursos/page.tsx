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
import {
  botonCabecera,
  botonPrimario,
  campo,
  panel,
  textoError,
} from "../_components/estilos";

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

  const [intercambiandoId, setIntercambiandoId] = useState<number | null>(null);
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
        bosquejoNumero: nuevo.bosquejoNumero ? Number(nuevo.bosquejoNumero) : null,
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
      <main>
        <PageHeader title="Asignar discursos" />
        <p className="mt-20 text-center text-sm text-apagado">Cargando…</p>
      </main>
    );
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximos = discursos
    .filter((d) => new Date(d.fecha.slice(0, 10) + "T00:00:00") >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Agrupa por mes
  const anioActual = hoy.getFullYear();
  const meses: { clave: string; titulo: string; anio: number; items: Discurso[] }[] = [];
  for (const d of proximos) {
    const f = new Date(d.fecha.slice(0, 10) + "T00:00:00");
    const clave = `${f.getFullYear()}-${f.getMonth()}`;
    const ultimo = meses[meses.length - 1];
    if (ultimo && ultimo.clave === clave) ultimo.items.push(d);
    else
      meses.push({
        clave,
        titulo: f.toLocaleDateString("es-ES", { month: "long" }),
        anio: f.getFullYear(),
        items: [d],
      });
  }

  const opcionesDiscursantes = discursantes.map((ds) => (
    <option key={ds.id} value={ds.id}>
      {ds.nombre}
      {ds.congregacionOrigen ? ` (${ds.congregacionOrigen})` : ""}
    </option>
  ));

  const opcionesBosquejos = bosquejos.map((b) => (
    <option key={b.numero} value={b.numero}>
      {b.numero}. {b.titulo}
    </option>
  ));

  const botonIcono =
    "shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors disabled:opacity-50";

  return (
    <main className="pb-10">
      <PageHeader
        title="Asignar discursos"
        subtitle="Quién viene cada domingo"
        right={
          <button
            onClick={() => setMostrarNuevo(!mostrarNuevo)}
            className={botonCabecera}
          >
            {mostrarNuevo ? "Cerrar" : "+ Nuevo"}
          </button>
        }
      />

      <div className="mx-auto max-w-md px-5">
        {error && <p className={`mt-4 text-center ${textoError}`}>{error}</p>}

        {mostrarNuevo && (
          <div className={`mt-5 ${panel}`}>
            <h2 className="font-serif text-lg text-texto">Nuevo discurso</h2>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-xs text-apagado">Fecha</span>
                <input
                  type="date"
                  value={nuevo.fecha}
                  onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })}
                  className={`mt-1 ${campo}`}
                />
              </label>
              <label className="block">
                <span className="text-xs text-apagado">Discursante</span>
                <select
                  value={nuevo.discursanteId}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, discursanteId: e.target.value })
                  }
                  className={`mt-1 ${campo}`}
                >
                  <option value="">Sin asignar</option>
                  {opcionesDiscursantes}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-apagado">Bosquejo</span>
                <select
                  value={nuevo.bosquejoNumero}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, bosquejoNumero: e.target.value })
                  }
                  className={`mt-1 ${campo}`}
                >
                  <option value="">Sin bosquejo</option>
                  {opcionesBosquejos}
                </select>
              </label>
            </div>
            <button
              onClick={crearNuevo}
              disabled={!nuevo.fecha || creando}
              className={`mt-4 w-full ${botonPrimario}`}
            >
              {creando ? "Guardando…" : "Guardar discurso"}
            </button>
          </div>
        )}

        {proximos.length === 0 && (
          <div className="mt-16 text-center">
            <p className="font-serif text-lg text-texto">
              No hay discursos programados
            </p>
            <p className="mt-1 text-sm text-apagado">
              Pulsa «+ Nuevo» para añadir el siguiente domingo.
            </p>
          </div>
        )}

        {meses.map((mes) => (
          <section key={mes.clave} className="mt-8">
            <h2 className="font-serif text-lg capitalize text-texto">
              {mes.titulo}
              {mes.anio !== anioActual && (
                <span className="ml-2 font-sans text-sm text-apagado">
                  {mes.anio}
                </span>
              )}
            </h2>
            <ul className="mt-2 divide-y divide-linea border-y border-linea">
              {mes.items.map((d) => (
                <li key={d.id} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-serif text-[1.05rem] first-letter:uppercase text-tinta">
                      {formatearFecha(d.fecha)}
                    </p>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setDestinoIntercambio("");
                          setIntercambiandoId(
                            intercambiandoId === d.id ? null : d.id,
                          );
                        }}
                        aria-label="Intercambiar con otro domingo"
                        title="Intercambiar con otro domingo"
                        className={`${botonIcono} ${
                          intercambiandoId === d.id
                            ? "bg-tinta-suave text-tinta"
                            : "text-apagado hover:bg-tinta-suave hover:text-tinta"
                        }`}
                      >
                        <IconSwap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminar(d)}
                        disabled={eliminandoId === d.id}
                        aria-label="Eliminar discurso"
                        title="Eliminar discurso"
                        className={`${botonIcono} text-apagado hover:bg-[#fbeeed] hover:text-[#b23c36]`}
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {intercambiandoId === d.id && (
                    <div className="mt-3 rounded-xl bg-tinta-suave p-3.5">
                      <p className="text-sm text-tinta">
                        Intercambia discursante y bosquejo con otro domingo. Los
                        dos quedarán como pendientes.
                      </p>
                      <select
                        value={destinoIntercambio}
                        onChange={(e) => setDestinoIntercambio(e.target.value)}
                        aria-label="Domingo con el que intercambiar"
                        className={`mt-2.5 ${campo}`}
                      >
                        <option value="">Elige el otro domingo…</option>
                        {proximos
                          .filter((x) => x.id !== d.id)
                          .map((x) => (
                            <option key={x.id} value={x.id}>
                              {formatearFecha(x.fecha)}:{" "}
                              {x.discursante?.nombre ?? "sin asignar"}
                            </option>
                          ))}
                      </select>
                      <div className="mt-2.5 flex gap-2">
                        <button
                          onClick={() => confirmarIntercambio(d.id)}
                          disabled={!destinoIntercambio || guardandoIntercambio}
                          className={`flex-1 ${botonPrimario}`}
                        >
                          {guardandoIntercambio ? "Intercambiando…" : "Intercambiar"}
                        </button>
                        <button
                          onClick={() => {
                            setIntercambiandoId(null);
                            setDestinoIntercambio("");
                          }}
                          className="flex-1 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-tinta transition-colors hover:bg-papel"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 space-y-2">
                    <select
                      value={d.discursanteId ?? ""}
                      disabled={guardandoId === d.id}
                      aria-label="Discursante"
                      onChange={(e) =>
                        asignar(d.id, {
                          discursanteId: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className={campo}
                    >
                      <option value="">Sin discursante</option>
                      {opcionesDiscursantes}
                    </select>
                    <select
                      value={d.bosquejoNumero ?? ""}
                      disabled={guardandoId === d.id}
                      aria-label="Bosquejo"
                      onChange={(e) =>
                        asignar(d.id, {
                          bosquejoNumero: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className={campo}
                    >
                      <option value="">Sin bosquejo</option>
                      {opcionesBosquejos}
                    </select>
                    <input
                      value={d.notas ?? ""}
                      onChange={(e) => cambiarNotas(d.id, e.target.value)}
                      onBlur={(e) => guardarNotas(d.id, e.target.value)}
                      placeholder="Notas: canción, imagen…"
                      aria-label="Notas"
                      className={campo}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
