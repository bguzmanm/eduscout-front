import { GraduationCap, Search, Building2 } from 'lucide-react';
import Link from 'next/link';
import { getJobs, getJobStats } from '@/lib/api';
import SourceLogo from '@/components/SourceLogo';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let recentJobs: Awaited<ReturnType<typeof getJobs>>['items'] = [];
  let stats: { totalActive: number; activeSources: number; bySource: { source: string; count: number }[]; byRegion: { region: string; count: number }[] } | null = null;

  try {
    const [jobsRes, statsRes] = await Promise.all([
      getJobs({ limit: 6 }),
      getJobStats(),
    ]);
    recentJobs = jobsRes.items;
    stats = statsRes;
  } catch {
    // Backend not available
  }

  return (
    <div className="pt-16">
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-azul tracking-tight">
            Ofertas académicas,
            <br />
            <span className="text-dorado">sin búsqueda agotadora</span>
          </h1>
          <p className="mt-4 text-lg text-piedra max-w-2xl mx-auto leading-relaxed">
            Recopilamos ofertas de trabajo para docentes de educación superior
            desde múltiples universidades chilenas. Todo en un solo lugar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/ofertas"
              className="inline-flex items-center justify-center gap-2 bg-azul text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-marino transition-colors"
            >
              <Search className="w-4 h-4" />
              Ver ofertas
            </Link>
            <Link
              href="/fuentes"
              className="inline-flex items-center justify-center gap-2 border border-tiza text-azul px-6 py-3 rounded-md text-sm font-semibold hover:border-dorado transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Ver fuentes
            </Link>
          </div>
        </div>
      </section>

      {stats && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-arena border border-tiza rounded-lg p-6 text-center">
                <p className="text-3xl font-display font-bold text-dorado">
                  {stats.totalActive}
                </p>
                <p className="text-sm text-piedra mt-1">Ofertas activas</p>
              </div>
              <div className="bg-arena border border-tiza rounded-lg p-6 text-center">
                <p className="text-3xl font-display font-bold text-dorado">
                  {stats.activeSources}
                </p>
                <p className="text-sm text-piedra mt-1">Fuentes activas</p>
              </div>
              <div className="bg-arena border border-tiza rounded-lg p-6 text-center">
                <p className="text-3xl font-display font-bold text-dorado">
                  {stats.byRegion.length}
                </p>
                <p className="text-sm text-piedra mt-1">Regiones</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {recentJobs.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-azul mb-6">
              Últimas ofertas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/ofertas/${job.id}`}
                  className="block bg-arena border border-tiza rounded-lg p-5 hover:border-dorado transition-colors"
                >
                  <h3 className="text-sm font-semibold text-azul font-display truncate">
                    {job.title}
                  </h3>
                  {job.company && (
                    <p className="text-xs text-piedra mt-1">{job.company}</p>
                  )}
                  <p className="text-xs text-piedra mt-2">
                    {job.location || 'Sin ubicación'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <SourceLogo src={job.sourceLogoUrl} name={job.sourceName} size={30} />
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-azul/10 text-azul">
                      {job.sourceName}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/ofertas"
                className="text-sm text-dorado hover:opacity-80 font-semibold"
              >
                Ver todas las ofertas →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-azul mb-10 text-center">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-dorado/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-display font-bold text-dorado">1</span>
              </div>
              <h3 className="font-semibold text-azul font-display">
                Recopilamos
              </h3>
              <p className="text-sm text-piedra mt-2">
                Buscamos automáticamente en las páginas de las principales
                universidades del país.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-dorado/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-display font-bold text-dorado">2</span>
              </div>
              <h3 className="font-semibold text-azul font-display">
                Organizamos
              </h3>
              <p className="text-sm text-piedra mt-2">
                Estandarizamos la información para que puedas comparar ofertas
                fácilmente.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-dorado/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-display font-bold text-dorado">3</span>
              </div>
              <h3 className="font-semibold text-azul font-display">
                Te dirigimos
              </h3>
              <p className="text-sm text-piedra mt-2">
                Cuando encontraste la ideal, te llevamos directo al sitio de la
                universidad para postular.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
