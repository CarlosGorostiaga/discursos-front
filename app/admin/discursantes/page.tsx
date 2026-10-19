"use client";

import { useEffect, useState } from "react";
import {
  obtenerDiscursantes,
  crearDiscursante,
  actualizarDiscursante,
  eliminarDiscursante,
  obtenerDiscursos,
  type Discursante,
  type Discurso,
} from "../../../lib/api";
import { formatearFecha } from "../../../lib/fechas";
import PageHeader from "../_components/PageHeader";
import SearchInput from "../_components/SearchInput";
import {
  botonCabecera,
  botonPeligro,
  botonPrimario,
  botonSecundario,
  campo,
  panel,
  textoError,
} from "../_components/estilos";

export default function DiscursantesPage() {
  const [discursantes, setDiscursantes] = useState<Discursante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    telefonoResponsable: "",
    congregacionOrigen: "",
  });
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [discursos, setDiscursos] = useState<Discurso[]>([]);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    obtenerDiscursantes()
      .then(setDiscursantes)
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    // Para avisar, al eliminar, de los discursos que tiene asignados
    obtenerDiscursos()
      .then(setDiscursos)
      .catch(() => {});
  }, []);

  function iniciarEdicion(d: Discursante) {
    setEditandoId(d.id);
    setForm({
      nombre: d.nombre,
      telefono: d.telefono,
      telefonoResponsable: d.telefonoResponsable ?? "",
      congregacionOrigen: d.congregacionOrigen ?? "",
    });
  }

  async function guardarEdicion(id: number) {
    await actualizarDiscursante(id, {
      nombre: form.nombre,
      telefono: form.telefono,
      telefonoResponsable: form.telefonoResponsable || null,
      congregacionOrigen: form.congregacionOrigen || null,
    });
    setEditandoId(null);
    cargar();
  }

  async function eliminar(d: Discursante) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const suyos = discursos.filter((x) => x.discursanteId === d.id);
    const proximos = suyos
      .filter((x) => new Date(x.fecha.slice(0, 10) + "T00:00:00") >= hoy)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    const pasados = suyos.length - proximos.length;

    let mensaje = `¿Eliminar a ${d.nombre}? Esta acción no se puede deshacer.`;
    if (proximos.length > 0) {
      const fechas = proximos.map((x) => `• ${formatearFecha(x.fecha)}`).join("\n");
      mensaje += `\n\nTiene ${proximos.length} ${proximos.length === 1 ? "discurso próximo asignado, que quedará" : "discursos próximos asignados, que quedarán"} sin asignar:\n${fechas}`;
    }
    if (pasados > 0) {
      mensaje += `\n\nEn el histórico, sus ${pasados} ${pasados === 1 ? "discurso pasado aparecerá" : "discursos pasados aparecerán"} como "Sin asignar".`;
    }
    if (!window.confirm(mensaje)) return;

    setEliminandoId(d.id);
    setError(null);
    try {
      await eliminarDiscursante(d.id);
      setDiscursantes((prev) => prev.filter((x) => x.id !== d.id));
      setDiscursos((prev) =>
        prev.map((x) =>
          x.discursanteId === d.id
            ? { ...x, discursanteId: null, discursante: null }
            : x,
        ),
      );
      setEditandoId(null);
    } catch {
      setError("No se pudo eliminar el discursante");
    } finally {
      setEliminandoId(null);
    }
  }

  async function crearNuevo() {
    await crearDiscursante({
      nombre: form.nombre,
      telefono: form.telefono,
      telefonoResponsable: form.telefonoResponsable || null,
      congregacionOrigen: form.congregacionOrigen || null,
    });
    setForm({
      nombre: "",
      telefono: "",
      telefonoResponsable: "",
      congregacionOrigen: "",
    });
    setMostrarNuevo(false);
    cargar();
  }

  const campos: {
    clave: keyof typeof form;
    texto: string;
    tipo?: string;
  }[] = [
    { clave: "nombre", texto: "Nombre" },
    { clave: "telefono", texto: "Teléfono", tipo: "tel" },
    { clave: "telefonoResponsable", texto: "Teléfono del responsable", tipo: "tel" },
    { clave: "congregacionOrigen", texto: "Congregación de origen" },
  ];

  const formularioCampos = (
    <div className="space-y-3">
      {campos.map((c) => (
        <label key={c.clave} className="block">
          <span className="text-xs text-apagado">{c.texto}</span>
          <input
            className={`mt-1 ${campo}`}
            type={c.tipo ?? "text"}
            value={form[c.clave]}
            onChange={(e) => setForm({ ...form, [c.clave]: e.target.value })}
          />
        </label>
      ))}
    </div>
  );

  const term = busqueda.trim().toLowerCase();
  const discursantesFiltrados = term
    ? discursantes.filter(
        (d) =>
          d.nombre.toLowerCase().includes(term) ||
          (d.congregacionOrigen ?? "").toLowerCase().includes(term),
      )
    : discursantes;

  return (
    <main className="pb-10">
      <PageHeader
        title="Discursantes"
        subtitle={`${discursantes.length} registrados`}
        right={
          <button
            onClick={() => {
              setMostrarNuevo(!mostrarNuevo);
              setEditandoId(null);
              setForm({
                nombre: "",
                telefono: "",
                telefonoResponsable: "",
                congregacionOrigen: "",
              });
            }}
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
            <h2 className="font-serif text-lg text-texto">Nuevo discursante</h2>
            <div className="mt-3">{formularioCampos}</div>
            <button
              onClick={crearNuevo}
              disabled={!form.nombre || !form.telefono}
              className={`mt-4 w-full ${botonPrimario}`}
            >
              Guardar discursante
            </button>
          </div>
        )}

        <div className="mt-5">
          <SearchInput
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre o congregación"
          />
        </div>

        {cargando && (
          <p className="mt-10 text-center text-sm text-apagado">Cargando…</p>
        )}
        {!cargando && term && discursantesFiltrados.length === 0 && (
          <p className="mt-10 text-center text-sm text-apagado">
            Ningún discursante coincide con &ldquo;{busqueda}&rdquo;
          </p>
        )}

        <ul className="mt-5 divide-y divide-linea border-y border-linea">
          {discursantesFiltrados.map((d) =>
            editandoId === d.id ? (
              <li key={d.id} className="py-4">
                <h2 className="font-serif text-lg text-texto">Editar discursante</h2>
                <div className="mt-3">{formularioCampos}</div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => guardarEdicion(d.id)}
                    className={`flex-1 ${botonPrimario}`}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditandoId(null)}
                    className={`flex-1 ${botonSecundario}`}
                  >
                    Cancelar
                  </button>
                </div>
                <button
                  onClick={() => eliminar(d)}
                  disabled={eliminandoId === d.id}
                  className={`mt-2 w-full ${botonPeligro}`}
                >
                  {eliminandoId === d.id ? "Eliminando…" : "Eliminar discursante"}
                </button>
              </li>
            ) : (
              <li key={d.id}>
                <button
                  onClick={() => iniciarEdicion(d)}
                  className="block w-full py-3.5 text-left transition-colors hover:bg-white"
                >
                  <p className="font-serif text-[1.05rem] text-texto">{d.nombre}</p>
                  {d.congregacionOrigen && (
                    <p className="mt-0.5 text-sm text-apagado">
                      Congregación {d.congregacionOrigen}
                    </p>
                  )}
                  <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-apagado/80">
                    <span>Tel. {d.telefono}</span>
                    {d.telefonoResponsable && (
                      <span>Responsable {d.telefonoResponsable}</span>
                    )}
                  </p>
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
    </main>
  );
}
