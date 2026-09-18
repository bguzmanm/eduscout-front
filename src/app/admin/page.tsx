'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SourceLogo from '@/components/SourceLogo';
import {
  getAdminCandidateStats,
  getScrapingReport,
  getScrapingReports,
  runScraping,
  updateSource,
  type AdminCandidateStats,
  type ScrapingRun,
} from '@/lib/api';
import {
  RefreshCw,
  LogOut,
  Play,
  Users,
  LayoutGrid,
  Activity,
} from 'lucide-react';

const SESSION_COOKIE = 'eduscout_admin_session';

type TabKey = 'fuentes' | 'candidatos' | 'scraping';

const TAB_KEYS: TabKey[] = ['fuentes', 'candidatos', 'scraping'];

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: 'fuentes', label: 'Fuentes', icon: LayoutGrid },
  { key: 'candidatos', label: 'Candidatos', icon: Users },
  { key: 'scraping', label: 'Scraping', icon: Activity },
];

function isValidTab(value: string): value is TabKey {
  return (TAB_KEYS as string[]).includes(value);
}

function getToken(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`),
  );
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

function runStatusInfo(run: ScrapingRun): {
  label: string;
  className: string;
} {
  switch (run.status) {
    case 'failed':
      return {
        label: 'Fallido',
        className: 'text-red-600 bg-red-50 border-red-200',
      };
    case 'running':
      return {
        label: 'En ejecución',
        className: 'text-dorado bg-yellow-50 border-yellow-200',
      };
    default:
      return {
        label: 'Completado',
        className: 'text-green-700 bg-green-50 border-green-200',
      };
  }
}

function percent(part: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="bg-arena border border-tiza rounded-lg p-5">
      <p className="text-3xl font-display font-bold text-dorado">{value}</p>
      <p className="text-sm text-piedra mt-1">{label}</p>
      {note && <p className="text-xs text-piedra/70 mt-0.5">{note}</p>}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('fuentes');

  const [sources, setSources] = useState<Source[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [candidateStats, setCandidateStats] =
    useState<AdminCandidateStats | null>(null);
  const [candidateStatsLoading, setCandidateStatsLoading] = useState(false);
  const [candidateStatsError, setCandidateStatsError] = useState<
    string | null
  >(null);

  const [report, setReport] = useState<ScrapingRun | null>(null);
  const [runs, setRuns] = useState<ScrapingRun[]>([]);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const [dataVersion, setDataVersion] = useState(0);
  const lastLoaded = useRef<Record<TabKey, number>>({
    fuentes: -1,
    candidatos: -1,
    scraping: -1,
  });

  useEffect(() => {
    const fromHash = window.location.hash.replace('#', '');
    if (!isValidTab(fromHash)) return;
    const reset = window.setTimeout(() => setTab(fromHash), 0);
    return () => window.clearTimeout(reset);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const fromHash = window.location.hash.replace('#', '');
      if (isValidTab(fromHash) && fromHash !== tab) setTab(fromHash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [tab]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (
        tab === 'fuentes' &&
        lastLoaded.current.fuentes !== dataVersion
      ) {
        lastLoaded.current.fuentes = dataVersion;
        try {
          const res = await fetch('/api/sources');
          const json = await res.json();
          if (!cancelled) setSources(json.data);
        } catch {
          if (!cancelled) {
            setSourcesError('No se pudieron cargar las fuentes.');
          }
        } finally {
          if (!cancelled) setSourcesLoading(false);
        }
      }

      if (
        tab === 'candidatos' &&
        lastLoaded.current.candidatos !== dataVersion
      ) {
        lastLoaded.current.candidatos = dataVersion;
        const token = getToken();
        try {
          const stats = await getAdminCandidateStats(token ?? '');
          if (!cancelled) setCandidateStats(stats);
        } catch {
          if (!cancelled) {
            setCandidateStatsError(
              'No se pudieron cargar los indicadores de candidatos.',
            );
          }
        } finally {
          if (!cancelled) setCandidateStatsLoading(false);
        }
      }

      if (
        tab === 'scraping' &&
        lastLoaded.current.scraping !== dataVersion
      ) {
        lastLoaded.current.scraping = dataVersion;
        const token = getToken();
        try {
          const [latest, history] = await Promise.all([
            getScrapingReport(token ?? ''),
            getScrapingReports(token ?? '', 10),
          ]);
          if (!cancelled) {
            setReport(latest);
            setRuns(history);
          }
        } catch {
          if (!cancelled) {
            setReportError(
              'No se pudieron cargar los informes de scraping.',
            );
          }
        } finally {
          if (!cancelled) setScrapingLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [tab, dataVersion]);

  function selectTab(next: TabKey) {
    if (next === 'fuentes' && lastLoaded.current.fuentes !== dataVersion) {
      setSourcesLoading(true);
    }
    if (
      next === 'candidatos' &&
      lastLoaded.current.candidatos !== dataVersion
    ) {
      setCandidateStatsLoading(true);
    }
    if (
      next === 'scraping' &&
      lastLoaded.current.scraping !== dataVersion
    ) {
      setScrapingLoading(true);
    }
    setTab(next);
    const url = `${window.location.pathname}${window.location.search}#${next}`;
    window.history.pushState(null, '', url);
  }

  function refresh() {
    setRunError(null);
    setSourcesError(null);
    setCandidateStatsError(null);
    setReportError(null);
    setSourcesLoading(true);
    setCandidateStatsLoading(true);
    setScrapingLoading(true);
    setDataVersion((v) => v + 1);
  }

  async function runNow() {
    const token = getToken();
    if (!token) {
      clearSession();
      router.push('/admin/login');
      return;
    }

    setRunning(true);
    setRunError(null);
    try {
      await runScraping(token);
      setDataVersion((v) => v + 1);
    } catch (err) {
      setRunError(
        err instanceof Error ? err.message : 'No se pudo ejecutar el scraping.',
      );
    } finally {
      setRunning(false);
    }
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

    setSources((prev) =>
      prev.map((s) =>
        s.id === source.id ? { ...s, isActive: !s.isActive } : s,
      ),
    );

    try {
      const updated = await updateSource(
        source.id,
        { isActive: !source.isActive },
        token,
      );
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

  const anyLoading = sourcesLoading || candidateStatsLoading || scrapingLoading;

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-azul">
              Administración
            </h1>
            <p className="text-sm text-piedra mt-1">
              Gestiona fuentes, revisa indicadores de candidatos y monitoriza
              el scraping.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={anyLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-azul border border-tiza rounded-lg hover:bg-tiza/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${anyLoading ? 'animate-spin' : ''}`}
              />
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

        <div className="flex gap-1 border-b border-tiza mb-8 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => selectTab(key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  active
                    ? 'border-dorado text-azul'
                    : 'border-transparent text-piedra hover:text-azul hover:bg-tiza/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>

        {tab === 'fuentes' && (
          <section>
            {sourcesError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
                {sourcesError}
              </div>
            )}

            {sourcesLoading && sources.length === 0 ? (
              <div className="text-center py-16 text-piedra">
                Cargando fuentes…
              </div>
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
                              <p className="font-medium text-azul">
                                {source.name}
                              </p>
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
                                source.isActive
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
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
          </section>
        )}

        {tab === 'candidatos' && (
          <section>
            {candidateStatsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {candidateStatsError}
              </div>
            )}

            {candidateStatsLoading && !candidateStats ? (
              <div className="bg-white border border-tiza rounded-xl p-8 text-center text-piedra text-sm">
                Cargando indicadores…
              </div>
            ) : candidateStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Perfiles creados"
                    value={candidateStats.totalCandidates}
                    note={`${candidateStats.registeredLast7d} en 7 días · ${candidateStats.registeredLast30d} en 30 días`}
                  />
                  <StatCard
                    label="Con CV"
                    value={candidateStats.candidatesWithCv}
                    note={`${percent(candidateStats.candidatesWithCv, candidateStats.totalCandidates)} del total`}
                  />
                  <StatCard
                    label="Con teléfono"
                    value={candidateStats.candidatesWithPhone}
                    note={`${percent(candidateStats.candidatesWithPhone, candidateStats.totalCandidates)} del total`}
                  />
                  <StatCard
                    label="Con CV y teléfono"
                    value={candidateStats.candidatesWithCvAndPhone}
                    note={`${percent(candidateStats.candidatesWithCvAndPhone, candidateStats.totalCandidates)} del total`}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Con al menos una alerta"
                    value={candidateStats.candidatesWithAlerts}
                    note={`${percent(candidateStats.candidatesWithAlerts, candidateStats.totalCandidates)} del total`}
                  />
                  <StatCard
                    label="Alertas activas"
                    value={`${candidateStats.activeAlerts}/${candidateStats.totalAlerts}`}
                    note={`${percent(candidateStats.activeAlerts, candidateStats.totalAlerts)} de las alertas creadas`}
                  />
                  <StatCard
                    label="Promedio de alertas"
                    value={candidateStats.avgAlertsPerCandidate}
                    note="por candidato con alertas"
                  />
                  <StatCard
                    label="Coincidencias generadas"
                    value={candidateStats.totalAlertMatches}
                    note="ofertas calzadas con alertas"
                  />
                </div>

                <div className="bg-white border border-tiza rounded-xl p-5">
                  <h3 className="text-sm font-display font-bold text-azul mb-3">
                    Distribución de alertas por candidato
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center justify-between border border-tiza rounded-lg px-4 py-3">
                      <span className="text-piedra">Sin alertas</span>
                      <span className="font-bold text-azul">
                        {candidateStats.alertsDistribution.noAlerts}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border border-tiza rounded-lg px-4 py-3">
                      <span className="text-piedra">1–2 alertas</span>
                      <span className="font-bold text-azul">
                        {candidateStats.alertsDistribution.fewAlerts}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border border-tiza rounded-lg px-4 py-3">
                      <span className="text-piedra">3+ alertas</span>
                      <span className="font-bold text-azul">
                        {candidateStats.alertsDistribution.manyAlerts}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {tab === 'scraping' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-piedra">
                  Ejecuta el scraping bajo demanda y revisa el historial de
                  corridas.
                </p>
              </div>
              <button
                onClick={runNow}
                disabled={running}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-dorado rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-60"
              >
                {running ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {running ? 'Ejecutando…' : 'Ejecutar scraping'}
              </button>
            </div>

            {runError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
                {runError}
              </div>
            )}
            {reportError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {reportError}
              </div>
            )}

            {scrapingLoading && !report ? (
              <div className="bg-white border border-tiza rounded-xl p-8 text-center text-piedra text-sm">
                Cargando informes…
              </div>
            ) : !report ? (
              <div className="bg-white border border-tiza rounded-xl p-8 text-center text-piedra text-sm mb-4">
                Sin informes todavía. El informe aparece tras la primera
                ejecución del scraping (cron de las 06:00 o ejecución manual).
              </div>
            ) : (
              <div className="bg-white border border-tiza rounded-xl overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-tiza flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${runStatusInfo(report).className}`}
                    >
                      {runStatusInfo(report).label}
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
            )}

            <h2 className="text-lg font-display font-bold text-azul mb-3">
              Historial de corridas
            </h2>
            {runs.length === 0 && !scrapingLoading ? (
              <div className="bg-white border border-tiza rounded-xl p-8 text-center text-piedra text-sm">
                Todavía no hay corridas registradas.
              </div>
            ) : (
              <div className="bg-white border border-tiza rounded-xl overflow-hidden divide-y divide-tiza/60">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="px-5 py-3 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${runStatusInfo(run).className}`}
                      >
                        {runStatusInfo(run).label}
                      </span>
                      <span className="text-xs text-piedra">
                        run #{run.id} ·{' '}
                        {formatDate(run.finishedAt ?? run.startedAt)} ·{' '}
                        {formatDuration(run.durationMs)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="text-green-700">
                        {run.totalNew} nuevas
                      </span>
                      <span className="text-azul">
                        {run.totalUpdated} actualizadas
                      </span>
                      <span
                        className={
                          run.totalErrors > 0 ? 'text-red-600' : 'text-piedra'
                        }
                      >
                        {run.totalErrors} errores
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}