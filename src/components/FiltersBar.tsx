'use client';

interface FilterOption {
  value: string;
  label: string;
}

interface FiltersBarProps {
  sources: FilterOption[];
  regions: FilterOption[];
  jobTypes: FilterOption[];
  selectedSource?: string;
  selectedRegion?: string;
  selectedJobType?: string;
}

export default function FiltersBar({
  sources,
  regions,
  jobTypes,
  selectedSource,
  selectedRegion,
  selectedJobType,
}: FiltersBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        name="source"
        defaultValue={selectedSource ?? ''}
        className="px-3.5 py-1.5 rounded text-xs font-medium border bg-arena border-tiza text-piedra focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado"
      >
        <option value="">Todas las fuentes</option>
        {sources.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        name="region"
        defaultValue={selectedRegion ?? ''}
        className="px-3.5 py-1.5 rounded text-xs font-medium border bg-arena border-tiza text-piedra focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado"
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
        defaultValue={selectedJobType ?? ''}
        className="px-3.5 py-1.5 rounded text-xs font-medium border bg-arena border-tiza text-piedra focus:outline-none focus:ring-2 focus:ring-dorado/30 focus:border-dorado"
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
