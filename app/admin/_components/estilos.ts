// Clases compartidas para que formularios y botones se vean igual en toda la app

export const campo =
  "w-full min-w-0 rounded-lg border border-linea bg-white px-3 py-2.5 text-sm text-texto placeholder:text-apagado/70 outline-none transition-colors focus:border-tinta focus:ring-2 focus:ring-tinta/15 disabled:opacity-60";

export const botonPrimario =
  "rounded-full bg-tinta px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-tinta-oscura disabled:opacity-50";

export const botonSecundario =
  "rounded-full bg-tinta-suave px-5 py-2.5 text-sm font-medium text-tinta transition-colors hover:bg-[#dde2ef] disabled:opacity-50";

export const botonPeligro =
  "rounded-full px-5 py-2.5 text-sm font-medium text-[#b23c36] transition-colors hover:bg-[#fbeeed] disabled:opacity-50";

/** Botón "+ Nuevo" sobre la cabecera índigo */
export const botonCabecera =
  "shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-tinta transition-colors hover:bg-tinta-suave";

/** Panel para formularios (crear / editar) */
export const panel = "rounded-xl border border-linea bg-white p-4";

export const textoError = "text-sm text-[#b23c36]";
