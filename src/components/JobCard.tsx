'use client';

import Link from 'next/link';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import SourceLogo from './SourceLogo';

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
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
}: JobCardProps) {
  return (
    <Link
      href={`/ofertas/${id}`}
      className="block bg-arena border border-tiza rounded-lg p-5 hover:border-dorado transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-azul font-display truncate">
            {title}
          </h3>
          {company && (
            <p className="text-sm text-piedra mt-1">{company}</p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-piedra shrink-0 mt-1" />
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
        <SourceLogo src={sourceLogoUrl} name={sourceName} size={20} />
        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-azul/10 text-azul">
          {sourceName}
        </span>
      </div>
    </Link>
  );
}
