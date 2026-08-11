"use client";

import { useEffect, useState } from "react";
import {
  obtenerDiscursos,
  actualizarEstadoDiscurso,
  type Discurso,
  type EstadoDiscurso,
} from "../../lib/api";
import { formatearFecha } from "../../lib/fechas";
import PageHeader from "./_components/PageHeader";

function generarMensaje(d: Discurso) {
  const fechaCorta = new Date(
    d.fecha.slice(0, 10) + "T00:00:00",
  ).toLocaleDateString("es-ES");
  const nombre = d.discursante?.nombre ?? "";
  const bosquejo = d.bosquejoNumero ?? "";
  const titulo = d.bosquejo?.titulo ?? "";
  return `Hola buenas, hermano ${nombre}, soy Carlos Gorostiaga de la congregación San Sebastián de los Reyes Centro, espero que estés bien. Quería confirmar que el próximo domingo ${fechaCorta} haces el discurso público en nuestra congregación.

El bosquejo asignado es el: ${bosquejo}     Tema:     ${titulo}     Si te es posible, necesitaría que me indicaras el número de canción y si deseas utilizar alguna imagen, la envíes al correo: sonido.sansecentro@gmail.com

Muchas gracias de antemano.

Recordarte que la reunión es el Domingo a las 10:00 y el Salón del Reino está en Avenida de la Dehesa n6, San Sebastián de los Reyes. CP 28702, Sala 1 (es la sala de la planta superior)
Muchas gracias por adelantado.
Saludos.
https://maps.app.goo.gl/39jQfhkQX7Kqzb4PA?g_st=iw`;
}

function enlaceWhatsapp(d: Discurso) {
  const telefono = (d.discursante?.telefono ?? "").replace(/[^\d]/g, "");
  const texto = encodeURIComponent(generarMensaje(d));
  return `https://wa.me/${telefono}?text=${texto}`;
}

function selectorEstado(
  d: Discurso,
  onChange: (estado: EstadoDiscurso) => void,
) {
  const estilos: Record<EstadoDiscurso, string> = {
    pendiente: "bg-gray-100 text-gray-600",
    enviado: "bg-blue-100 text-blue-700",
    confirmado: "bg-green-100 text-green-700",
    rechazado: "bg-red-100 text-red-700",
  };
  return (
    <select
      value={d.estado}
      onChange={(e) => onChange(e.target.value as EstadoDiscurso)}
      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 outline-none cursor-pointer ${estilos[d.estado]}`}
    >
      <option value="pendiente">Pendiente</option>
      <option value="enviado">Enviado</option>
      <option value="confirmado">Confirmado</option>
      <option value="rechazado">Rechazado</option>
    </select>
  );
}

export default function AdminPage() {
  const [discursos, setDiscursos] = useState<Discurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerDiscursos()
      .then((data) => setDiscursos(data))
      .catch(() => setError("No se pudieron cargar los discursos"))
      .finally(() => setCargando(false));
  }, []);

  async function cambiarEstado(id: number, nuevoEstado: EstadoDiscurso) {
    // Actualiza en pantalla al instante
    setDiscursos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: nuevoEstado } : d)),
    );
    try {
      await actualizarEstadoDiscurso(id, nuevoEstado);
    } catch {
      setError("No se pudo guardar el cambio de estado");
    }
  }

  if (cargando) {
    return (
      <main className="flex items-center justify-center py-24">
        <p className="text-gray-500 text-sm">Cargando discursos…</p>
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

  // Solo discursos con fecha desde hoy en adelante, ordenados
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximos = discursos
    .filter((d) => new Date(d.fecha.slice(0, 10) + "T00:00:00") >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const [proximo, ...resto] = proximos;

  if (!proximo) {
    return (
      <main className="pb-10">
        <PageHeader
          title="Discursos públicos"
          subtitle="San Sebastián de los Reyes Centro"
          back={false}
        />
        <p className="text-gray-500 text-sm text-center mt-24">
          No hay próximos discursos
        </p>
      </main>
    );
  }

  return (
    <main className="pb-10">
      <PageHeader
        title="Discursos públicos"
        subtitle="San Sebastián de los Reyes Centro"
        back={false}
      />

      <section className="px-4 mt-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Esta semana
        </h2>
        <div className="bg-white rounded-2xl shadow-md shadow-gray-200/60 ring-1 ring-blue-100 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium capitalize">
                {formatearFecha(proximo.fecha)}
              </p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                {proximo.discursante?.nombre ?? "Sin asignar"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {proximo.bosquejoNumero
                  ? `Bosquejo ${proximo.bosquejoNumero}`
                  : ""}
                {proximo.bosquejo?.titulo
                  ? ` · ${proximo.bosquejo.titulo}`
                  : ""}
              </p>
            </div>
            {selectorEstado(proximo, (estado) =>
              cambiarEstado(proximo.id, estado),
            )}
          </div>

          {proximo.discursante && (
            <a
              href={enlaceWhatsapp(proximo)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:from-green-700 active:to-emerald-700 text-white font-medium text-sm py-3 rounded-xl transition-colors shadow-sm shadow-green-200"
            >
              Enviar recordatorio por WhatsApp
            </a>
          )}
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Próximos discursos
        </h2>
        <div className="space-y-2">
          {resto.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500 capitalize">
                  {formatearFecha(d.fecha)}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {d.discursante?.nombre ?? "Sin asignar"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {d.bosquejoNumero ? `Bosquejo ${d.bosquejoNumero}` : ""}
                  {d.bosquejo?.titulo ? ` · ${d.bosquejo.titulo}` : ""}
                </p>
              </div>
              {selectorEstado(d, (estado) => cambiarEstado(d.id, estado))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
