import { getSources } from '@/lib/api';
import { ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

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

        {sources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source) => (
              <div
                key={source.id}
                className="bg-arena border border-tiza rounded-lg p-5 hover:border-dorado transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-azul font-display">
                      {source.name}
                    </h3>
                    <p className="text-xs text-piedra mt-1">
                      Tipo: {source.scraperType}
                    </p>
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
                </div>

                <a
                  href={source.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-xs text-dorado hover:opacity-80 font-semibold"
                >
                  Visitar sitio
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
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
