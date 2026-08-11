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
      <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Borrar búsqueda"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}
