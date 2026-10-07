import type { ChangeEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-slate-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search food or drinks..."
        aria-label="Search food or drinks"
        className="h-12 w-full rounded-2xl border border-[#e5dfd2] bg-white pl-11 pr-10 text-sm text-slate-900 shadow-[0_3px_12px_rgba(32,38,32,0.04)] outline-none transition placeholder:text-slate-400 focus:border-[#9b7540] focus:ring-4 focus:ring-[#b28a50]/10"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-lg text-slate-400 transition hover:text-slate-700"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;