import { getSources } from '@/lib/api';
import { ExternalLink, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import SourceLogo from '@/components/SourceLogo';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = {
  universidad_publica: 'Universidades Públicas',
  universidad_privada: 'Universidades Privadas',
  instituto_profesional: 'Institutos Profesionales',
  centro_formacion_tecnica: 'Centros de Formación Técnica',
  otec: 'OTECs',
};

const CATEGORY_ORDER = [
  'universidad_publica',
  'universidad_privada',
  'instituto_profesional',
  'centro_formacion_tecnica',
  'otec',
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Nunca';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Nunca';
  }
}

export default async function FuentesPage() {
  let sources: Awaited<ReturnType<typeof getSources>> = [];

  try {
    sources = await getSources();
  } catch {
    // Backend not available
  }

  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat] ?? cat,
      items: sources.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-display font-bold text-azul mb-2">
          Fuentes de datos
        </h1>
        <p className="text-sm text-piedra mb-8">
          Universidades e instituciones de las que recopilamos ofertas
          académicas.
        </p>

        {grouped.length > 0 ? (
          <div className="space-y-10">
            {grouped.map((group) => (
              <section key={group.category}>
                <h2 className="text-lg font-display font-bold text-azul mb-4 flex items-center gap-2">
                  {group.label}
                  <span className="text-xs font-normal text-piedra font-sans">
                    ({group.items.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((source) => (
                    <div
                      key={source.id}
                      className="bg-arena border border-tiza rounded-lg p-5 hover:border-dorado transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 flex items-start gap-3">
                          <SourceLogo
                            src={source.logoUrl}
                            name={source.name}
                            size={56}
                            className="mt-0.5"
                          />
                          <div>
                            <h3 className="text-base font-semibold text-azul font-display">
                              {source.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-azul/10 text-azul">
                                {CATEGORY_LABELS[source.category] ?? source.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        {source.isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </div>

                      <div className="mt-4 text-xs text-piedra space-y-1">
                        <p>
                          Último scraping:{' '}
                          <span className="font-medium text-azul">
                            {formatDate(source.lastScraped)}
                          </span>
                        </p>
                        <p>
                          Estado:{' '}
                          <span
                            className={
                              source.isActive
                                ? 'text-green-600 font-medium'
                                : 'text-red-500 font-medium'
                            }
                          >
                            {source.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </p>
                        <p>
                          Ofertas:{' '}
                          <span className="font-medium text-azul">
                            {source.jobCount}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <Link
                          href={`/ofertas?source=${source.slug}`}
                          className="inline-flex items-center gap-1 text-xs text-dorado hover:opacity-80 font-semibold"
                        >
                          Ver ofertas
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <a
                          href={source.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-dorado hover:opacity-80 font-semibold"
                        >
                          Visitar sitio
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-piedra">
              No se pudieron cargar las fuentes. Verifica que el backend esté
              corriendo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
