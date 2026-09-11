'use client';

import { useRouter } from 'next/navigation';

interface FilterOption {
  value: string;
  label: string;
}

interface FiltersBarProps {
  sources: FilterOption[];
  regions: FilterOption[];
  jobTypes: FilterOption[];
  categories: FilterOption[];
  selectedSource?: string;
  selectedRegion?: string;
  selectedJobType?: string;
  selectedCategory?: string;
}

function buildUrl(key: string, value: string) {
  const sp = new URLSearchParams(window.location.search);
  if (value) {
    sp.set(key, value);
  } else {
    sp.delete(key);
  }
  sp.delete('page');
  const qs = sp.toString();
  return `/ofertas${qs ? '?' + qs : ''}`;
}

export default function FiltersBar({
  sources,
  regions,
  jobTypes,
  categories,
  selectedSource,
  selectedRegion,
  selectedJobType,
  selectedCategory,
}: FiltersBarProps) {
  const router = useRouter();

  function handleChange(key: string, value: string) {
    router.push(buildUrl(key, value), { scroll: false });
  }

  const selectClass =
    'px-3.5 py-1.5 rounded text-xs font-medium border bg-arena border-tiza text-piedra focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado';

  return (
    <div className="flex flex-wrap gap-3">
      <select
        name="source"
        value={selectedSource ?? ''}
        onChange={(e) => handleChange('source', e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las fuentes</option>
        {sources.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        name="category"
        value={selectedCategory ?? ''}
        onChange={(e) => handleChange('category', e.target.value)}
        className={selectClass}
      >
        <option value="">Todos los tipos de institución</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        name="region"
        value={selectedRegion ?? ''}
        onChange={(e) => handleChange('region', e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las regiones</option>
        {regions.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <select
        name="jobType"
        value={selectedJobType ?? ''}
        onChange={(e) => handleChange('jobType', e.target.value)}
        className={selectClass}
      >
        <option value="">Todos los tipos</option>
        {jobTypes.map((j) => (
          <option key={j.value} value={j.value}>
            {j.label}
          </option>
        ))}
      </select>
    </div>
  );
}