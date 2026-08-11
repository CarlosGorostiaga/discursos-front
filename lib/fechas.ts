export function formatearFecha(fecha: string) {
  const d = new Date(fecha.slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
