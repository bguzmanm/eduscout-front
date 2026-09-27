'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { SavedJob, getSavedJobs } from '@/lib/api';
import { useSavedJobs } from './SavedJobsProvider';
import JobCard from './JobCard';

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Santiago',
    });
  } catch {
    return '';
  }
}

export default function SavedJobsPanel({ token }: { token: string }) {
  const { ready, isSaved, refresh } = useSavedJobs();
  const [saved, setSaved] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      setLoading(true);
      setError(null);
      try {
        const [result] = await Promise.all([getSavedJobs(token), refresh()]);
        if (!cancelled) setSaved(result);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, refresh]);

  if (loading || !ready) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-azul animate-spin" />
      </div>
    );
  }

  const available = saved.filter((s) => s.job !== null && isSaved(s.job.id));
  const unavailable = saved.filter((s) => s.job === null).length;
  const isEmpty = available.length === 0 && unavailable === 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="bg-white border border-tiza rounded-xl p-6 sm:p-8">
        <h3 className="text-lg font-display font-bold text-azul mb-1 flex items-center gap-2">
          <Bookmark className="w-5 h-5" />
          Ofertas guardadas ({available.length})
        </h3>
        <p className="text-sm text-piedra">
          Guarda ofertas con el ícono de marcador para revisarlas con calma y
          volver a ellas cuando quieras.
        </p>
      </div>

      {isEmpty ? (
        <div className="text-center py-16 bg-white border border-tiza rounded-xl">
          <Bookmark className="w-8 h-8 text-piedra mx-auto mb-3" />
          <p className="text-piedra">
            Aún no has guardado ofertas. Usa el ícono de marcador en cualquier
            oferta para tenerla aquí.
          </p>
        </div>
      ) : available.length === 0 ? (
        <div className="text-center py-16 bg-white border border-tiza rounded-xl">
          <Bookmark className="w-8 h-8 text-piedra mx-auto mb-3" />
          <p className="text-piedra">
            Las ofertas que guardaste ya no están disponibles en las fuentes.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {available.map((item) => {
              const job = item.job!;
              return (
                <div key={item.id}>
                  <JobCard
                    id={job.id}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    jobType={job.jobType}
                    deadline={job.deadline}
                    sourceName={job.sourceName}
                    sourceSlug={job.sourceSlug}
                    sourceLogoUrl={job.sourceLogoUrl}
                  />
                  <p className="mt-1.5 text-xs text-piedra">
                    Guardada el {formatDate(item.savedAt)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setReloadKey((k) => k + 1);
                void refresh();
              }}
              className="text-sm text-dorado hover:opacity-80 font-semibold"
            >
              Actualizar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
