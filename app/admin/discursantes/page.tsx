"use client";

import { useEffect, useState } from "react";
import {
  obtenerDiscursantes,
  crearDiscursante,
  actualizarDiscursante,
  type Discursante,
} from "../../../lib/api";
import PageHeader from "../_components/PageHeader";
import SearchInput from "../_components/SearchInput";

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

  function cargar() {
    obtenerDiscursantes()
      .then(setDiscursantes)
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
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

  const formularioCampos = (
    <div className="space-y-2">
      <input
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors"
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />
      <input
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors"
        placeholder="Teléfono discursante"
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
      />
      <input
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors"
        placeholder="Teléfono responsable"
        value={form.telefonoResponsable}
        onChange={(e) =>
          setForm({ ...form, telefonoResponsable: e.target.value })
        }
      />
      <input
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors"
        placeholder="Congregación de origen"
        value={form.congregacionOrigen}
        onChange={(e) =>
          setForm({ ...form, congregacionOrigen: e.target.value })
        }
      />
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
            className="shrink-0 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-full shadow-sm shadow-blue-200 transition-colors"
          >
            + Nuevo
          </button>
        }
      />

      <div className="px-4 mt-4">
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre o congregación…"
        />
      </div>

      {mostrarNuevo && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {formularioCampos}
            <button
              onClick={crearNuevo}
              className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="px-4 mt-4 space-y-2">
        {cargando && <p className="text-sm text-gray-500">Cargando…</p>}
        {!cargando && term && discursantesFiltrados.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-6">
            Sin resultados para &ldquo;{busqueda}&rdquo;
          </p>
        )}
        {discursantesFiltrados.map((d) =>
          editandoId === d.id ? (
            <div
              key={d.id}
              className="bg-white rounded-2xl ring-2 ring-blue-200 shadow-sm p-4"
            >
              {formularioCampos}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => guardarEdicion(d.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div
              key={d.id}
              onClick={() => iniciarEdicion(d)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 cursor-pointer hover:shadow-md hover:ring-1 hover:ring-blue-200 transition-shadow"
            >
              <p className="text-sm font-medium text-gray-900">{d.nombre}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {d.telefono}{" "}
                {d.congregacionOrigen ? `· ${d.congregacionOrigen}` : ""}
              </p>
              {d.telefonoResponsable && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Responsable: {d.telefonoResponsable}
                </p>
              )}
            </div>
          ),
        )}
      </div>
    </main>
  );
}
