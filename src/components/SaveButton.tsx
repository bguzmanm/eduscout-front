'use client';

import { Bookmark } from 'lucide-react';
import { useSavedJobs } from './SavedJobsProvider';

interface SaveButtonProps {
  jobId: number;
  variant?: 'icon' | 'label';
  className?: string;
}

export default function SaveButton({
  jobId,
  variant = 'icon',
  className = '',
}: SaveButtonProps) {
  const { isSaved, toggle } = useSavedJobs();
  const saved = isSaved(jobId);
  const label = saved ? 'Quitar de guardados' : 'Guardar oferta';

  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-60';
  const sizing =
    variant === 'icon'
      ? 'p-2 rounded-full shrink-0'
      : 'px-4 py-2.5 text-sm rounded-lg shrink-0';
  const tones = saved
    ? 'bg-dorado/15 text-dorado hover:bg-dorado/25'
    : 'text-piedra hover:text-azul hover:bg-tiza/60';

  return (
    <button
      type="button"
      onClick={() => void toggle(jobId)}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`${base} ${sizing} ${tones} ${className}`}
    >
      <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
      {variant === 'label' && <span>{saved ? 'Guardada' : 'Guardar'}</span>}
    </button>
  );
}
