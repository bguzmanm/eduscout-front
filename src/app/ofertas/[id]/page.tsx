import { getJob, type Job } from '@/lib/api';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import SourceLogo from '@/components/SourceLogo';
import SaveButton from '@/components/SaveButton';
import ShareMenu from '@/components/ShareMenu';
import JsonLd from '@/components/JsonLd';
import DOMPurify from 'isomorphic-dompurify';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(text: string, max = 158): string {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}

function jobDescription(job: Job): string {
  const raw = stripHtml(job.description ?? job.requirements ?? '');
  if (raw) return truncate(raw);
  const parts = [job.company, job.location, job.jobType].filter(Boolean).join(' · ');
  return parts || `Oferta de ${job.sourceName} recopilada por EduScout.`;
}

function toEmploymentType(jobType: string | null): string | undefined {
  if (!jobType) return undefined;
  const value = jobType.toLowerCase();
  if (value.includes('completa') || value.includes('full')) return 'FULL_TIME';
  if (value.includes('media') || value.includes('parcial') || value.includes('part'))
    return 'PART_TIME';
  if (value.includes('reemplazo') || value.includes('temporal')) return 'TEMPORARY';
  if (value.includes('hora')) return 'PER_DIEM';
  return undefined;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Fecha ISO 8601 con zona horaria; `undefined` si el dato no es válido. */
function toIsoDate(dateStr: string | null): string | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/**
 * Google exige `validThrough` en todo JobPosting. Si la oferta no trae fecha
 * límite se estima 30 días desde la publicación (o desde hoy si tampoco hay
 * fecha de publicación).
 */
function toValidThrough(job: Job): string {
  const deadline = toIsoDate(job.deadline);
  if (deadline) return deadline;

  const published = job.publishedAt ? new Date(job.publishedAt) : new Date();
  const base = Number.isNaN(published.getTime()) ? new Date() : published;
  return new Date(base.getTime() + 30 * DAY_MS).toISOString();
}

/** "Providencia, Metropolitana" → "Providencia" (comuna). */
function toAddressLocality(location: string | null): string | undefined {
  if (!location) return undefined;
  const locality = location.split(',')[0]?.trim();
  return locality || undefined;
}

/**
 * Los adapters guardan el sueldo como "$1.500.000 - $2.000.000" o
 * "$1.500.000" (CLP, punto como separador de miles). Google solo acepta un
 * valor único en `baseSalary`, así que se informa el mínimo.
 */
function parseSalaryMin(salaryRange: string | null): number | undefined {
  if (!salaryRange) return undefined;
  const match =
    salaryRange.match(/\$\s*([\d.]+)/) ?? salaryRange.match(/([\d.]{4,})/);
  if (!match) return undefined;

  const value = Number(match[1].replace(/\./g, ''));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Descripción completa para JobPosting (Google no acepta texto truncado). */
function jobPostingDescription(job: Job): string {
  const raw = stripHtml(job.description ?? job.requirements ?? '');
  return raw || jobDescription(job);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) return {};

  let job: Job;
  try {
    job = await getJob(jobId);
  } catch {
    return {};
  }
  if (!job) return {};

  const description = jobDescription(job);
  return {
    title: job.title,
    description,
    alternates: {
      canonical: `/ofertas/${job.id}`,
    },
    openGraph: {
      type: 'article',
      title: job.title,
      description,
      url: `${SITE_URL}/ofertas/${job.id}`,
      images: ['/opengraph-image'],
    },
  };
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Santiago',
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

  const employmentType = toEmploymentType(job.jobType);
  const addressLocality = toAddressLocality(job.location);
  const salaryMin = parseSalaryMin(job.salaryRange);

  return (
    <div className="pt-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: jobPostingDescription(job),
          datePosted: toIsoDate(job.publishedAt) ?? toIsoDate(job.createdAt),
          validThrough: toValidThrough(job),
          ...(employmentType ? { employmentType } : {}),
          ...(job.department ? { department: job.department } : {}),
          identifier: {
            '@type': 'PropertyValue',
            name: job.sourceName,
            value: job.externalId,
          },
          hiringOrganization: {
            '@type': 'Organization',
            name: job.company ?? job.sourceName,
          },
          jobLocation: {
            '@type': 'Place',
            ...(job.location ? { name: job.location } : {}),
            address: {
              '@type': 'PostalAddress',
              ...(addressLocality ? { addressLocality } : {}),
              ...(job.region ? { addressRegion: job.region } : {}),
              ...(job.postalCode ? { postalCode: job.postalCode } : {}),
              addressCountry: 'CL',
            },
          },
          ...(salaryMin
            ? {
                baseSalary: {
                  '@type': 'MonetaryAmount',
                  currency: 'CLP',
                  value: {
                    '@type': 'QuantitativeValue',
                    value: salaryMin,
                    unitText: 'MONTH',
                  },
                },
              }
            : {}),
          url: `${SITE_URL}/ofertas/${job.id}`,
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href={backUrl}
          className="text-sm text-dorado hover:opacity-80 font-semibold mb-6 inline-block"
        >
          ← Volver a ofertas
        </Link>

        <div className="bg-arena border border-tiza rounded-2xl p-5 sm:p-8 wrap-anywhere">
          <div className="flex items-center justify-end gap-2 mb-4">
            <SaveButton jobId={job.id} variant="label" />
            <ShareMenu jobId={job.id} title={job.title} variant="label" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="min-w-0">
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
              className="mt-1 shrink-0"
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

          <div className="mt-8 pt-6 border-t border-tiza flex flex-col sm:flex-row sm:items-center gap-3">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-dorado text-white px-6 py-3 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Postular en {job.sourceName}
              <ExternalLink className="w-4 h-4" />
            </a>
            <div className="flex items-center gap-2 sm:ml-auto">
              <SaveButton jobId={job.id} variant="label" />
              <ShareMenu
                jobId={job.id}
                title={job.title}
                variant="label"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
