"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  obtenerDiscursos,
  actualizarEstadoDiscurso,
  type Discurso,
  type EstadoDiscurso,
} from "../../lib/api";
import { SelectorEstado } from "./_components/Estado";
import { botonPrimario } from "./_components/estilos";

function aFecha(fecha: string) {
  return new Date(fecha.slice(0, 10) + "T00:00:00");
}

function generarMensaje(d: Discurso) {
  const fechaCorta = aFecha(d.fecha).toLocaleDateString("es-ES");
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

function Cabecera({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-tinta text-white">
      <div className="mx-auto max-w-md px-5 pt-6 pb-7">
        <p className="text-sm text-white/70">
          San Sebastián de los Reyes Centro
        </p>
        <h1 className="mt-0.5 font-serif text-xl">Discursos públicos</h1>
        {children}
      </div>
    </header>
  );
}

export default function AdminPage() {
  const [discursos, setDiscursos] = useState<Discurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerDiscursos()
      .then((data) => setDiscursos(data))
      .catch(() => setError("No se pudieron cargar los discursos. Revisa la conexión y recarga la página."))
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
      setError("No se pudo guardar el cambio de estado. Inténtalo de nuevo.");
    }
  }

  if (cargando || error) {
    return (
      <main>
        <Cabecera />
        <p
          className={`mt-20 px-6 text-center text-sm ${error ? "text-[#c0504a]" : "text-apagado"}`}
        >
          {error ?? "Cargando discursos…"}
        </p>
      </main>
    );
  }

  // Solo discursos con fecha desde hoy en adelante, ordenados
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximos = discursos
    .filter((d) => aFecha(d.fecha) >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const [proximo, ...resto] = proximos;

  if (!proximo) {
    return (
      <main>
        <Cabecera />
        <div className="mx-auto mt-16 max-w-md px-6 text-center">
          <p className="font-serif text-lg text-texto">
            No hay discursos programados
          </p>
          <p className="mt-1 text-sm text-apagado">
            Añade el siguiente domingo desde Asignar.
          </p>
          <Link
            href="/admin/discursos"
            className={`mt-5 inline-block ${botonPrimario}`}
          >
            Ir a Asignar
          </Link>
        </div>
      </main>
    );
  }

  const fechaProximo = aFecha(proximo.fecha);
  const dias = Math.round((fechaProximo.getTime() - hoy.getTime()) / 86400000);
  const cuando =
    dias === 0 ? "Hoy" : dias <= 7 ? "Este domingo" : "Próximo discurso";

  // Agrupa el resto por mes
  const anioActual = hoy.getFullYear();
  const meses: { clave: string; titulo: string; anio: number; items: Discurso[] }[] = [];
  for (const d of resto) {
    const f = aFecha(d.fecha);
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

  return (
    <main className="pb-10">
      <Cabecera>
        <div className="mt-7 border-t border-white/15 pt-6">
          <p className="text-sm text-white/70">{cuando}, a las 10:00</p>
          <p className="mt-1 font-serif text-[2.75rem] leading-none tracking-tight">
            {fechaProximo.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
            })}
          </p>

          <div className="mt-6">
            <p className="font-serif text-2xl leading-snug">
              {proximo.discursante?.nombre ?? "Sin discursante asignado"}
            </p>
            {proximo.discursante?.congregacionOrigen && (
              <p className="mt-0.5 text-sm text-white/70">
                Congregación {proximo.discursante.congregacionOrigen}
              </p>
            )}
          </div>

          {(proximo.bosquejo?.titulo || proximo.bosquejoNumero) && (
            <div className="mt-5 border-l-2 border-white/30 pl-3.5">
              {proximo.bosquejo?.titulo && (
                <p className="font-serif text-[1.0625rem] leading-relaxed text-white/95">
                  «{proximo.bosquejo.titulo}»
                </p>
              )}
              {proximo.bosquejoNumero && (
                <p className="mt-1 text-xs text-white/60">
                  Bosquejo n.º {proximo.bosquejoNumero}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <SelectorEstado
              estado={proximo.estado}
              onChange={(estado) => cambiarEstado(proximo.id, estado)}
              sobreOscuro
            />
            {proximo.discursante && (
              <a
                href={enlaceWhatsapp(proximo)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-whatsapp-oscuro"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5Zm0 17.3c-1.5 0-3-.4-4.2-1.2l-.3-.2-2.8.8.8-2.7-.2-.3A7.8 7.8 0 1 1 12 19.8Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.4 6.4 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.2Z" />
                </svg>
                Enviar recordatorio
              </a>
            )}
          </div>
        </div>
      </Cabecera>

      <div className="mx-auto max-w-md px-5">
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
                <li key={d.id} className="flex items-start gap-4 py-4">
                  <div className="w-9 shrink-0 pt-0.5 text-center">
                    <p className="font-serif text-2xl leading-none text-tinta">
                      {aFecha(d.fecha).getDate()}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-texto">
                      {d.discursante?.nombre ?? (
                        <span className="text-apagado">Sin asignar</span>
                      )}
                    </p>
                    {d.bosquejo?.titulo && (
                      <p className="mt-0.5 font-serif text-sm leading-snug text-apagado">
                        {d.bosquejo.titulo}
                      </p>
                    )}
                    {d.bosquejoNumero && (
                      <p className="mt-1 text-xs text-apagado/80">
                        Bosquejo n.º {d.bosquejoNumero}
                      </p>
                    )}
                  </div>
                  <SelectorEstado
                    estado={d.estado}
                    onChange={(estado) => cambiarEstado(d.id, estado)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
