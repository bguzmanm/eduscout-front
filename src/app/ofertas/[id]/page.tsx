import { getJob } from '@/lib/api';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import SourceLogo from '@/components/SourceLogo';
import DOMPurify from 'isomorphic-dompurify';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

function isHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

function sanitize(text: string | null): string | null {
  if (!text) return null;
  return DOMPurify.sanitize(text, {
    FORBID_ATTR: ['style', 'class', 'id'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'img', 'video', 'form', 'input'],
  });
}

export default async function OfertaDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const jobId = parseInt(id, 10);

  if (isNaN(jobId)) {
    notFound();
  }

  let job;
  try {
    job = await getJob(jobId);
  } catch {
    notFound();
  }

  if (!job) {
    notFound();
  }

  const backUrl = from?.startsWith('/ofertas') ? from : '/ofertas';

  return (
    <div className="pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href={backUrl}
          className="text-sm text-dorado hover:opacity-80 font-semibold mb-6 inline-block"
        >
          ← Volver a ofertas
        </Link>

        <div className="bg-arena border border-tiza rounded-2xl p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-azul">
                  {job.title}
                </h1>
                {job.company && (
                  <p className="text-lg text-piedra mt-2">{job.company}</p>
                )}
              </div>
            </div>
            <SourceLogo
              src={job.sourceLogoUrl}
              name={job.sourceName}
              size={72}
              className="mt-1"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-piedra">
            {job.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
            {job.jobType && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {job.jobType}
              </span>
            )}
            {job.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Publicado: {formatDate(job.publishedAt)}
              </span>
            )}
            {job.deadline && (
              <span className="text-dorado font-semibold">
                Fecha límite: {formatDate(job.deadline)}
              </span>
            )}
          </div>

          {job.department && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-azul mb-2">
                Departamento / Facultad
              </h3>
              <p className="text-sm text-piedra">{job.department}</p>
            </div>
          )}

          {job.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-azul mb-2">
                Descripción
              </h3>
              {isHtml(job.description) ? (
                <div
                  className="rich-text text-sm text-piedra leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitize(job.description) ?? '' }}
                />
              ) : (
                <p className="text-sm text-piedra leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              )}
            </div>
          )}

          {job.requirements && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-azul mb-2">
                Requisitos
              </h3>
              {isHtml(job.requirements) ? (
                <div
                  className="rich-text text-sm text-piedra leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitize(job.requirements) ?? '' }}
                />
              ) : (
                <p className="text-sm text-piedra leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-tiza">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-dorado text-white px-6 py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Postular en {job.sourceName}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
