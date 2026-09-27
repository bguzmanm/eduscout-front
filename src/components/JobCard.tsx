'use client';

import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import SourceLogo from './SourceLogo';
import SaveButton from './SaveButton';
import ShareMenu from './ShareMenu';

interface JobCardProps {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  jobType: string | null;
  deadline: string | null;
  sourceName: string;
  sourceSlug: string;
  sourceLogoUrl?: string | null;
  backUrl?: string;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Santiago',
    });
  } catch {
    return null;
  }
}

export default function JobCard({
  id,
  title,
  company,
  location,
  jobType,
  deadline,
  sourceName,
  sourceLogoUrl,
  backUrl,
}: JobCardProps) {
  const href = `/ofertas/${id}${backUrl ? `?from=${encodeURIComponent(backUrl)}` : ''}`;

  return (
    <article className="relative bg-arena border border-tiza rounded-lg p-5 hover:border-dorado transition-colors">
      <Link
        href={href}
        className="absolute inset-0 rounded-lg focus-visible:outline-offset-4"
      >
        <span className="sr-only">{title}</span>
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-azul font-display truncate">
            {title}
          </h3>
          {company && <p className="text-sm text-piedra mt-1">{company}</p>}
        </div>
        <div className="relative z-10 flex items-center gap-1 shrink-0">
          <ShareMenu jobId={id} title={title} />
          <SaveButton jobId={id} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-piedra">
        {location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </span>
        )}
        {jobType && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {jobType}
          </span>
        )}
        {deadline && (
          <span className="text-dorado font-medium">
            Cierre: {formatDate(deadline)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <SourceLogo src={sourceLogoUrl} name={sourceName} size={32} />
        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-azul/10 text-azul">
          {sourceName}
        </span>
      </div>
    </article>
  );
}
