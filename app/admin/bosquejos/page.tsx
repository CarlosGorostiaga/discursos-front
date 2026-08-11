"use client";

import { useEffect, useState } from "react";
import {
  obtenerBosquejos,
  guardarBosquejo,
  type Bosquejo,
} from "../../../lib/api";
import PageHeader from "../_components/PageHeader";
import SearchInput from "../_components/SearchInput";

export default function BosquejosPage() {
  const [bosquejos, setBosquejos] = useState<Bosquejo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoNumero, setEditandoNumero] = useState<number | null>(null);
  const [tituloEdit, setTituloEdit] = useState("");
  const [nuevo, setNuevo] = useState({ numero: "", titulo: "" });
  const [busqueda, setBusqueda] = useState("");

  function cargar() {
    obtenerBosquejos()
      .then(setBosquejos)
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardarEdicion(numero: number) {
    await guardarBosquejo(numero, tituloEdit);
    setEditandoNumero(null);
    cargar();
  }

  async function crearNuevo() {
    const num = parseInt(nuevo.numero, 10);
    if (!num || !nuevo.titulo) return;
    await guardarBosquejo(num, nuevo.titulo);
    setNuevo({ numero: "", titulo: "" });
    cargar();
  }

  const term = busqueda.trim().toLowerCase();
  const bosquejosFiltrados = term
    ? bosquejos.filter(
        (b) =>
          b.titulo.toLowerCase().includes(term) ||
          String(b.numero).includes(term),
      )
    : bosquejos;

  return (
    <main className="pb-10">
      <PageHeader title="Bosquejos" subtitle={`${bosquejos.length} registrados`} />

      <div className="px-4 mt-4">
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por número o título…"
        />
      </div>

      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Añadir bosquejo
          </p>
          <div className="flex gap-2">
            <input
              className="w-20 border border-gray-200 rounded-xl px-2 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors"
              placeholder="Núm."
              value={nuevo.numero}
              onChange={(e) => setNuevo({ ...nuevo, numero: e.target.value })}
            />
            <input
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors"
              placeholder="Título del bosquejo"
              value={nuevo.titulo}
              onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
            />
          </div>
          <button
            onClick={crearNuevo}
            className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {cargando && <p className="text-sm text-gray-500">Cargando…</p>}
        {!cargando && term && bosquejosFiltrados.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-6">
            Sin resultados para &ldquo;{busqueda}&rdquo;
          </p>
        )}
        {bosquejosFiltrados.map((b) =>
          editandoNumero === b.numero ? (
            <div
              key={b.numero}
              className="bg-white rounded-2xl ring-2 ring-blue-200 shadow-sm p-3.5"
            >
              <p className="text-xs text-gray-400 mb-1">Bosquejo {b.numero}</p>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors"
                value={tituloEdit}
                onChange={(e) => setTituloEdit(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => guardarEdicion(b.numero)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditandoNumero(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div
              key={b.numero}
              onClick={() => {
                setEditandoNumero(b.numero);
                setTituloEdit(b.titulo);
              }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 cursor-pointer hover:shadow-md hover:ring-1 hover:ring-blue-200 transition-shadow flex items-center gap-3"
            >
              <span className="text-sm font-semibold text-blue-500 w-10 shrink-0">
                {b.numero}
              </span>
              <span className="text-sm text-gray-900">{b.titulo}</span>
            </div>
          ),
        )}
      </div>
    </main>
  );
}
