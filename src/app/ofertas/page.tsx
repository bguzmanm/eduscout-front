import { getJobs, getSources } from '@/lib/api';
import JobCard from '@/components/JobCard';
import SearchBar from '@/components/SearchBar';
import FiltersBar from '@/components/FiltersBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{
    q?: string;
    source?: string;
    region?: string;
    jobType?: string;
    page?: string;
  }>;
}

const REGIONS = [
  'Metropolitana',
  'Valparaíso',
  'Biobío',
  'Araucanía',
  'Ñuble',
  'O\'Higgins',
  'Maule',
  'Los Lagos',
  'Antofagasta',
  'Coquimbo',
];

const JOB_TYPES = [
  'Jornada Completa',
  'Part Time',
  'Mixta',
  'Teletrabajo',
];

export default async function OfertasPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);

  let jobs: Awaited<ReturnType<typeof getJobs>>['items'] = [];
  let meta = { page: 1, limit: 20, total: 0, totalPages: 0 };
  let sources: Awaited<ReturnType<typeof getSources>> = [];

  try {
    const [jobsRes, sourcesRes] = await Promise.all([
      getJobs({
        page,
        limit: 20,
        q: params.q,
        source: params.source,
        region: params.region,
        jobType: params.jobType,
      }),
      getSources(),
    ]);
    jobs = jobsRes.items;
    meta = jobsRes.meta;
    sources = sourcesRes;
  } catch {
    // Backend not available
  }

  const sourceOptions = sources.map((s) => ({ value: s.slug, label: s.name }));
  const regionOptions = REGIONS.map((r) => ({ value: r, label: r }));
  const jobTypeOptions = JOB_TYPES.map((j) => ({ value: j, label: j }));

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.source) sp.set('source', params.source);
    if (params.region) sp.set('region', params.region);
    if (params.jobType) sp.set('jobType', params.jobType);
    if (p > 1) sp.set('page', String(p));
    return `/ofertas${sp.toString() ? '?' + sp.toString() : ''}`;
  }

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-display font-bold text-azul mb-6">
          Ofertas de trabajo
        </h1>

        <form method="GET" className="space-y-4">
          <SearchBar defaultValue={params.q ?? ''} />
          <FiltersBar
            sources={sourceOptions}
            regions={regionOptions}
            jobTypes={jobTypeOptions}
            selectedSource={params.source}
            selectedRegion={params.region}
            selectedJobType={params.jobType}
          />
          <button
            type="submit"
            className="bg-azul text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-marino transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="mt-8">
          {meta.total > 0 && (
            <p className="text-sm text-piedra mb-4">
              {meta.total} oferta{meta.total !== 1 ? 's' : ''} encontrada{meta.total !== 1 ? 's' : ''}
            </p>
          )}

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  jobType={job.jobType}
                  deadline={job.deadline}
                  sourceName={job.sourceName}
                  sourceSlug={job.sourceSlug}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-piedra">
                No se encontraron ofertas con los filtros seleccionados.
              </p>
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-piedra hover:text-azul border border-tiza rounded-md hover:border-dorado transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Link>
              )}
              <span className="px-3 py-2 text-sm text-azul font-medium">
                Página {meta.page} de {meta.totalPages}
              </span>
              {page < meta.totalPages && (
                <Link
                  href={buildPageUrl(page + 1)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-piedra hover:text-azul border border-tiza rounded-md hover:border-dorado transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
