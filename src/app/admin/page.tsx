'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SourceLogo from '@/components/SourceLogo';
import { getScrapingReport, updateSource, type ScrapingRun } from '@/lib/api';
import { RefreshCw, LogOut } from 'lucide-react';

const SESSION_COOKIE = 'eduscout_admin_session';

function getToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function clearSession() {
  document.cookie = `${SESSION_COOKIE}=; path=/admin; max-age=0; samesite=strict`;
}

interface Source {
  id: number;
  name: string;
  slug: string;
  scraperType: string;
  logoUrl: string | null;
  isActive: boolean;
  lastScraped: string | null;
  jobCount: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Nunca';
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function reportStatusInfo(run: ScrapingRun): {
  label: string;
  className: string;
} {
  switch (run.status) {
    case 'failed':
      return { label: 'Fallido', className: 'text-red-600 bg-red-50 border-red-200' };
    case 'running':
      return { label: 'En ejecución', className: 'text-dorado bg-yellow-50 border-yellow-200' };
    default:
      return { label: 'Completado', className: 'text-green-700 bg-green-50 border-green-200' };
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [report, setReport] = useState<ScrapingRun | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    (async () => {
      try {
        const res = await fetch('/api/sources');
        const json = await res.json();
        if (!cancelled) setSources(json.data);

        if (token) {
          try {
            const latest = await getScrapingReport(token);
            if (!cancelled) setReport(latest);
          } catch {
            if (!cancelled) {
              setReportError('No se pudo cargar el informe de scraping.');
            }
          }
        }
      } catch {
        if (!cancelled) setError('No se pudieron cargar las fuentes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function refresh() {
    setLoading(true);
    setError(null);
    setReportError(null);
    setRefreshKey((k) => k + 1);
  }

  function logout() {
    clearSession();
    router.push('/admin/login');
  }

  async function toggleSource(source: Source) {
    const token = getToken();
    if (!token) {
      clearSession();
      router.push('/admin/login');
      return;
    }

    setTogglingId(source.id);

    // Optimistic update
    setSources((prev) =>
      prev.map((s) =>
        s.id === source.id ? { ...s, isActive: !s.isActive } : s,
      ),
    );

    try {
      const updated = await updateSource(source.id, {
        isActive: !source.isActive,
      }, token);

      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? updated : s)),
      );
    } catch {
      setSources((prev) =>
        prev.map((s) =>
          s.id === source.id ? { ...s, isActive: source.isActive } : s,
        ),
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-azul">
              Administración
            </h1>
            <p className="text-sm text-piedra mt-1">
              Activa o desactiva fuentes de datos individualmente.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-azul border border-tiza rounded-lg hover:bg-tiza/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading && sources.length === 0 ? (
          <div className="text-center py-16 text-piedra">Cargando fuentes…</div>
        ) : sources.length === 0 ? (
          <div className="text-center py-16 text-piedra">
            No hay fuentes registradas.
          </div>
        ) : (
          <div className="bg-white border border-tiza rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tiza bg-arena/60">
                  <th className="text-left font-semibold text-azul px-5 py-3 font-display">
                    Fuente
                  </th>
                  <th className="text-left font-semibold text-azul px-5 py-3 font-display hidden sm:table-cell">
                    Scraper
                  </th>
                  <th className="text-right font-semibold text-azul px-5 py-3 font-display">
                    Ofertas
                  </th>
                  <th className="text-left font-semibold text-azul px-5 py-3 font-display hidden md:table-cell">
                    Último scraping
                  </th>
                  <th className="text-center font-semibold text-azul px-5 py-3 font-display">
                    Activa
                  </th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr
                    key={source.id}
                    className="border-b border-tiza/60 last:border-0 hover:bg-arena/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <SourceLogo
                          src={source.logoUrl}
                          name={source.name}
                          size={36}
                        />
                        <div>
                          <p className="font-medium text-azul">{source.name}</p>
                          <p className="text-xs text-piedra font-mono">
                            {source.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs font-mono text-piedra bg-arena border border-tiza rounded px-2 py-0.5">
                        {source.scraperType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-azul">
                      {source.jobCount}
                    </td>
                    <td className="px-5 py-4 text-xs text-piedra hidden md:table-cell">
                      {formatDate(source.lastScraped)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => toggleSource(source)}
                        disabled={togglingId === source.id}
                        aria-label={
                          source.isActive
                            ? `Desactivar ${source.name}`
                            : `Activar ${source.name}`
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                          source.isActive
                            ? 'bg-green-600'
                            : 'bg-piedra/40'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            source.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-display font-bold text-azul mb-4">
            Último scraping
          </h2>

          {reportError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {reportError}
            </div>
          )}

          {!report && !reportError ? (
            <div className="bg-white border border-tiza rounded-xl p-8 text-center text-piedra text-sm">
              Sin informes todavía. El informe aparece tras la primera ejecución
              del scraping (cron de las 06:00 o ejecución manual).
            </div>
          ) : report ? (
            <div className="bg-white border border-tiza rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-tiza flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${reportStatusInfo(report).className}`}
                  >
                    {reportStatusInfo(report).label}
                  </span>
                  <span className="text-xs text-piedra">
                    {formatDate(report.finishedAt ?? report.startedAt)} ·{' '}
                    {formatDuration(report.durationMs)} · run #{report.id}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="text-green-700">
                    {report.totalNew} nuevas
                  </span>
                  <span className="text-azul">
                    {report.totalUpdated} actualizadas
                  </span>
                  <span
                    className={
                      report.totalErrors > 0
                        ? 'text-red-600'
                        : 'text-piedra'
                    }
                  >
                    {report.totalErrors} errores
                  </span>
                </div>
              </div>

              <div className="divide-y divide-tiza/60">
                {(report.perSource ?? []).map((source) => (
                  <div key={source.slug} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none shrink-0">
                          {source.status === 'error' ? '🔴' : '🟢'}
                        </span>
                        <p className="font-medium text-azul truncate">
                          {source.name}
                        </p>
                        <span className="text-xs text-piedra font-mono shrink-0">
                          ({source.slug})
                        </span>
                      </div>
                      <div className="text-xs text-piedra whitespace-nowrap">
                        {source.newCount} nueva
                        {source.newCount === 1 ? '' : 's'} ·{' '}
                        {source.updatedCount} actualizada
                        {source.updatedCount === 1 ? '' : 's'} ·{' '}
                        {formatDuration(source.durationMs)}
                      </div>
                    </div>
                    {source.status === 'error' && (
                      <ul className="mt-1.5 space-y-0.5">
                        {source.errors.slice(0, 3).map((error, i) => (
                          <li
                            key={i}
                            className="text-xs text-red-600 pl-5 truncate"
                          >
                            {error}
                          </li>
                        ))}
                        {source.errors.length > 3 && (
                          <li className="text-xs text-red-500 pl-5">
                            y {source.errors.length - 3} errores más…
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
