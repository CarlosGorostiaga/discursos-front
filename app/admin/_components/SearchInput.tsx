function IconSearch(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-apagado pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-linea bg-white pl-10 pr-9 py-2.5 text-sm text-texto placeholder:text-apagado/70 outline-none transition-colors focus:border-tinta focus:ring-2 focus:ring-tinta/15"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Borrar búsqueda"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-tinta-suave hover:bg-[#dde2ef] text-tinta text-xs transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}
