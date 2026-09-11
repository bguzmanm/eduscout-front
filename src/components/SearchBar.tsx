'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
}

let pendingQuery: string | null = null;

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Buscar ofertas por título...',
}: SearchBarProps) {
  const [value, setValue] = useState(
    pendingQuery ?? defaultValue ?? '',
  );

  function handleChange(next: string) {
    pendingQuery = next;
    setValue(next);
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-piedra" />
      <input
        type="text"
        name="q"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-arena border border-tiza rounded-md text-sm text-azul placeholder:text-piedra/50 focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado"
      />
    </div>
  );
}