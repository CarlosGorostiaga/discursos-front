"use client";

import { useEffect, useState } from "react";
import {
  obtenerBosquejos,
  guardarBosquejo,
  type Bosquejo,
} from "../../../lib/api";
import PageHeader from "../_components/PageHeader";
import SearchInput from "../_components/SearchInput";
import {
  botonCabecera,
  botonPrimario,
  botonSecundario,
  campo,
  panel,
} from "../_components/estilos";

export default function BosquejosPage() {
  const [bosquejos, setBosquejos] = useState<Bosquejo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoNumero, setEditandoNumero] = useState<number | null>(null);
  const [tituloEdit, setTituloEdit] = useState("");
  const [nuevo, setNuevo] = useState({ numero: "", titulo: "" });
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
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
    setMostrarNuevo(false);
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
      <PageHeader
        title="Bosquejos"
        subtitle={`${bosquejos.length} registrados`}
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
        {mostrarNuevo && (
          <div className={`mt-5 ${panel}`}>
            <h2 className="font-serif text-lg text-texto">Nuevo bosquejo</h2>
            <div className="mt-3 flex gap-2">
              <input
                className={`w-20! shrink-0 ${campo}`}
                placeholder="Núm."
                inputMode="numeric"
                value={nuevo.numero}
                onChange={(e) => setNuevo({ ...nuevo, numero: e.target.value })}
              />
              <input
                className={campo}
                placeholder="Título del bosquejo"
                value={nuevo.titulo}
                onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
              />
            </div>
            <button
              onClick={crearNuevo}
              disabled={!nuevo.numero || !nuevo.titulo}
              className={`mt-3 w-full ${botonPrimario}`}
            >
              Guardar bosquejo
            </button>
          </div>
        )}

        <div className="mt-5">
          <SearchInput
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por número o título"
          />
        </div>

        {cargando && (
          <p className="mt-10 text-center text-sm text-apagado">Cargando…</p>
        )}
        {!cargando && term && bosquejosFiltrados.length === 0 && (
          <p className="mt-10 text-center text-sm text-apagado">
            Ningún bosquejo coincide con &ldquo;{busqueda}&rdquo;
          </p>
        )}

        <ul className="mt-5 divide-y divide-linea border-y border-linea">
          {bosquejosFiltrados.map((b) =>
            editandoNumero === b.numero ? (
              <li key={b.numero} className="py-4">
                <p className="text-xs text-apagado">Bosquejo n.º {b.numero}</p>
                <input
                  className={`mt-1.5 ${campo}`}
                  value={tituloEdit}
                  onChange={(e) => setTituloEdit(e.target.value)}
                  autoFocus
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => guardarEdicion(b.numero)}
                    className={`flex-1 ${botonPrimario}`}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditandoNumero(null)}
                    className={`flex-1 ${botonSecundario}`}
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            ) : (
              <li key={b.numero}>
                <button
                  onClick={() => {
                    setEditandoNumero(b.numero);
                    setTituloEdit(b.titulo);
                  }}
                  className="flex w-full items-baseline gap-4 py-3.5 text-left transition-colors hover:bg-white"
                >
                  <span className="w-9 shrink-0 text-right font-serif text-lg text-tinta">
                    {b.numero}
                  </span>
                  <span className="font-serif text-[0.95rem] leading-snug text-texto">
                    {b.titulo}
                  </span>
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
    </main>
  );
}
