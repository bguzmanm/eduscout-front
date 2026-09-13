'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  X,
} from 'lucide-react';
import {
  AlertItem,
  AlertMatch,
  createAlert,
  deleteAlert,
  getAlertMatches,
  getAlerts,
  getCandidateToken,
  updateAlert,
} from '@/lib/api';
import { REGIONS, JOB_TYPES, CATEGORIES } from '@/lib/filters';
import JobCard from '@/components/JobCard';

const MAX_FREE_KEYWORDS = 6;

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export default function AlertasPage() {
  const router = useRouter();
  const token = getCandidateToken();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [matches, setMatches] = useState<Record<number, AlertMatch[]>>({});
  const [matchesLoading, setMatchesLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!token) {
      router.replace('/perfil');
      return;
    }
    (async () => {
      try {
        setAlerts(await getAlerts(token));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  function toggleChip(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleCreateAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreateError(null);
    setCreating(true);
    try {
      const keywords = keywordsText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, MAX_FREE_KEYWORDS);
      const created = await createAlert(token, {
        name: name.trim(),
        keywords,
        regions,
        jobTypes,
        categories,
      });
      setAlerts((prev) => [created, ...prev]);
      setName('');
      setKeywordsText('');
      setRegions([]);
      setJobTypes([]);
      setCategories([]);
    } catch (err) {
      setCreateError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(alertId: number, alert: AlertItem) {
    if (!token) return;
    try {
      const updated = await updateAlert(token, alertId, { isActive: !alert.isActive });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? updated : a)),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(alertId: number) {
    if (!token) return;
    if (!window.confirm('¿Eliminar esta alerta? Se perderán sus ofertas asociadas.')) {
      return;
    }
    try {
      await deleteAlert(token, alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setMatches((prev) => {
        const next = { ...prev };
        delete next[alertId];
        return next;
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleToggleMatches(alertId: number) {
    if (!token) return;
    const willExpand = !expanded[alertId];
    setExpanded((prev) => ({ ...prev, [alertId]: willExpand }));

    if (willExpand && !matches[alertId]) {
      setMatchesLoading((prev) => ({ ...prev, [alertId]: true }));
      try {
        const result = await getAlertMatches(token, alertId);
        setMatches((prev) => ({ ...prev, [alertId]: result }));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setMatchesLoading((prev) => ({ ...prev, [alertId]: false }));
      }
    }
  }

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-arena">
        <Loader2 className="w-8 h-8 text-azul animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-arena">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-azul/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-azul" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-azul">Mis alertas</h1>
            <p className="text-sm text-piedra">
              Recibe automáticamente las ofertas nuevas que calcen con tus criterios.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-6">
            {error}
          </div>
        )}

        <div className="bg-white border border-tiza rounded-xl p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-display font-bold text-azul mb-1 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva alerta
          </h2>
          <p className="text-sm text-piedra mb-5">
            Déjala sin criterios para recibir todas las ofertas nuevas.
          </p>

          <form onSubmit={handleCreateAlert} className="space-y-5">
            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                {createError}
              </div>
            )}

            <div>
              <label htmlFor="alert-name" className="block text-sm font-medium text-azul mb-1">
                Nombre de la alerta
              </label>
              <input
                id="alert-name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                placeholder="Ej: Historia en la RM"
              />
            </div>

            <div>
              <label htmlFor="alert-keywords" className="block text-sm font-medium text-azul mb-1">
                Palabras clave
              </label>
              <input
                id="alert-keywords"
                type="text"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                className="w-full px-3 py-2 border border-tiza rounded-lg text-sm text-azul focus:outline-none focus:ring-2 focus:ring-dorado/50 focus:border-dorado transition-colors"
                placeholder="profesor, historia, ciencias (separadas por coma)"
              />
              <p className="text-xs text-piedra mt-1">
                Máximo {MAX_FREE_KEYWORDS} palabras clave.
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-azul mb-2">Regiones</span>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleChip(regions, r, setRegions)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      regions.includes(r)
                        ? 'bg-azul text-white border-azul'
                        : 'bg-white text-piedra border-tiza hover:border-dorado'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-azul mb-2">Tipo de jornada</span>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((jt) => (
                  <button
                    key={jt}
                    type="button"
                    onClick={() => toggleChip(jobTypes, jt, setJobTypes)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      jobTypes.includes(jt)
                        ? 'bg-azul text-white border-azul'
                        : 'bg-white text-piedra border-tiza hover:border-dorado'
                    }`}
                  >
                    {jt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-azul mb-2">Tipo de institución</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleChip(categories, c.value, setCategories)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      categories.includes(c.value)
                        ? 'bg-azul text-white border-azul'
                        : 'bg-white text-piedra border-tiza hover:border-dorado'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-azul rounded-lg hover:bg-marino transition-colors disabled:opacity-60"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear alerta
            </button>
          </form>
        </div>

        <h2 className="text-lg font-display font-bold text-azul mb-4">
          Mis alertas ({alerts.length})
        </h2>

        {alerts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-tiza rounded-xl">
            <Bell className="w-8 h-8 text-piedra mx-auto mb-3" />
            <p className="text-piedra">
              Aún no creas alertas. Crea la primera arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white border border-tiza rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-display font-bold text-azul truncate">
                        {alert.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {alert.categories.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded-full text-xs font-medium bg-dorado/15 text-dorado">
                            {categoryLabel(c)}
                          </span>
                        ))}
                        {alert.regions.map((r) => (
                          <span key={r} className="px-2 py-0.5 rounded-full text-xs font-medium bg-azul/10 text-azul">
                            {r}
                          </span>
                        ))}
                        {alert.jobTypes.map((jt) => (
                          <span key={jt} className="px-2 py-0.5 rounded-full text-xs font-medium bg-tiza text-piedra">
                            {jt}
                          </span>
                        ))}
                        {alert.keywords.map((k) => (
                          <span key={k} className="px-2 py-0.5 rounded-full text-xs font-medium bg-tiza text-piedra">
                            {k}
                          </span>
                        ))}
                        {alert.categories.length +
                          alert.regions.length +
                          alert.jobTypes.length +
                          alert.keywords.length ===
                          0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-tiza text-piedra">
                            Todas las ofertas
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-piedra">
                        {alert.matchCount} oferta{alert.matchCount !== 1 ? 's' : ''} coincidentes
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle(alert.id, alert)}
                        title={alert.isActive ? 'Pausar alerta' : 'Activar alerta'}
                        className={`p-2 rounded-full transition-colors ${
                          alert.isActive
                            ? 'bg-azul/10 text-azul hover:bg-azul/20'
                            : 'bg-tiza text-piedra hover:bg-tiza/70'
                        }`}
                      >
                        {alert.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(alert.id)}
                        title="Eliminar alerta"
                        className="p-2 rounded-full text-piedra hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleMatches(alert.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-azul hover:bg-azul/10 rounded-lg transition-colors"
                      >
                        {matchesLoading[alert.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : expanded[alert.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        {expanded[alert.id] ? 'Ocultar' : 'Ver ofertas'}
                      </button>
                    </div>
                  </div>
                </div>

                {expanded[alert.id] && (
                  <div className="border-t border-tiza bg-arena p-5">
                    {matchesLoading[alert.id] ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-azul animate-spin" />
                      </div>
                    ) : (matches[alert.id]?.length ?? 0) > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches[alert.id]?.map((m) => (
                          <JobCard
                            key={m.id}
                            id={m.job.id}
                            title={m.job.title}
                            company={m.job.company}
                            location={m.job.location}
                            jobType={m.job.jobType}
                            deadline={m.job.deadline}
                            sourceName={m.job.sourceName}
                            sourceSlug={m.job.sourceSlug}
                            sourceLogoUrl={m.job.sourceLogoUrl}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <X className="w-6 h-6 text-piedra mb-2" />
                        <p className="text-sm text-piedra">
                          Aún no hay ofertas que calcen con esta alerta.
                        </p>
                        <p className="text-xs text-piedra/70 mt-1">
                          Las alertas se revisan en cada actualización de las fuentes.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}