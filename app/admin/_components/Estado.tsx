import type { EstadoDiscurso } from "../../../lib/api";

export const estados: { valor: EstadoDiscurso; texto: string; punto: string }[] = [
  { valor: "pendiente", texto: "Pendiente", punto: "bg-[#a3a9b8]" },
  { valor: "enviado", texto: "Enviado", punto: "bg-[#5b7fc7]" },
  { valor: "confirmado", texto: "Confirmado", punto: "bg-[#3a9d66]" },
  { valor: "rechazado", texto: "Rechazado", punto: "bg-[#c0504a]" },
];

function datos(estado: EstadoDiscurso) {
  return estados.find((e) => e.valor === estado) ?? estados[0];
}

/** Estado de solo lectura: punto de color + texto */
export function EstadoEtiqueta({ estado }: { estado: EstadoDiscurso }) {
  const actual = datos(estado);
  return (
    <span className="inline-flex shrink-0 items-center gap-2 py-1.5 text-xs font-medium text-apagado">
      <span className={`h-2 w-2 rounded-full ${actual.punto}`} />
      {actual.texto}
    </span>
  );
}

/** Estado editable: mismo aspecto, con un select nativo encima */
export function SelectorEstado({
  estado,
  onChange,
  sobreOscuro = false,
}: {
  estado: EstadoDiscurso;
  onChange: (estado: EstadoDiscurso) => void;
  sobreOscuro?: boolean;
}) {
  const actual = datos(estado);
  return (
    <label
      className={`relative inline-flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-3 pr-7 text-xs font-medium transition-colors focus-within:outline-2 focus-within:outline-offset-2 ${
        sobreOscuro
          ? "bg-white/10 text-white hover:bg-white/15 focus-within:outline-white"
          : "text-apagado hover:bg-tinta-suave focus-within:outline-tinta"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${actual.punto}`} />
      {actual.texto}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-2.5 h-3 w-3 opacity-60"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
      <select
        value={estado}
        onChange={(e) => onChange(e.target.value as EstadoDiscurso)}
        aria-label="Estado del discurso"
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {estados.map((e) => (
          <option key={e.valor} value={e.valor}>
            {e.texto}
          </option>
        ))}
      </select>
    </label>
  );
}
