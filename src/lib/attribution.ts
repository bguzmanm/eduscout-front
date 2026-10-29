// Atribución de registros: guarda en el navegador el canal por el que llegó el
// visitante para enviarlo cuando cree su cuenta. Sin cookies de terceros ni
// scripts externos: sólo almacenamiento local del propio sitio.

export interface Attribution {
  acquisitionSource?: string;
  acquisitionMedium?: string;
  acquisitionCampaign?: string;
  acquisitionReferrer?: string;
}

interface StoredAttribution extends Attribution {
  savedAt: number;
}

const STORAGE_KEY = 'eduscout:attribution';

// La atribución caduca para no acreditar un canal demasiado antiguo.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Dominios frecuentes → canal legible; el resto se guarda como dominio.
const REFERRER_CHANNELS: Array<[RegExp, string]> = [
  [/(^|\.)google\./, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)(facebook\.com|fb\.me)$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin'],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, 'twitter'],
  [/(^|\.)(t\.me|telegram\.org)$/, 'telegram'],
  [/(^|\.)whatsapp\.com$/, 'whatsapp'],
  [/(^|\.)youtube\.com$/, 'youtube'],
  [/(^|\.)reddit\.com$/, 'reddit'],
];

function clean(value: string | null | undefined, maxLength: number): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLength);
}

function hostOf(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host || undefined;
  } catch {
    return undefined;
  }
}

function isInternalHost(host: string): boolean {
  const own = window.location.hostname.replace(/^www\./, '');
  return host === own || host.endsWith(`.${own}`);
}

function channelFromHost(host: string): string {
  for (const [pattern, channel] of REFERRER_CHANNELS) {
    if (pattern.test(host)) return channel;
  }
  return host;
}

function readStored(): StoredAttribution | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (!parsed || typeof parsed.savedAt !== 'number') return undefined;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function persist(attribution: Attribution): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...attribution, savedAt: Date.now() }),
    );
  } catch {
    // Almacenamiento bloqueado (modo privado): se pierde la atribución.
  }
}

/**
 * Registra el canal de llegada. Debe ejecutarse una vez al cargar el sitio:
 * - con parámetros utm_* en la URL, la campaña actual manda (último toque);
 * - sin utm_*, sólo se guarda el primer referrer externo (primer toque);
 * - la navegación interna y el tráfico directo nunca sobrescriben el dato.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const source = clean(params.get('utm_source'), 100);
    const medium = clean(params.get('utm_medium'), 100);
    const campaign = clean(params.get('utm_campaign'), 150);

    if (source || medium || campaign) {
      persist({
        acquisitionSource: source,
        acquisitionMedium: medium,
        acquisitionCampaign: campaign,
        acquisitionReferrer: hostOf(document.referrer),
      });
      return;
    }

    if (readStored()) return;

    const referrerHost = hostOf(document.referrer);
    if (!referrerHost || isInternalHost(referrerHost)) return;

    persist({
      acquisitionSource: channelFromHost(referrerHost),
      acquisitionReferrer: referrerHost,
    });
  } catch {
    // Sin datos de atribución: el registro sigue funcionando igual.
  }
}

/** Devuelve la atribución vigente para adjuntarla al registro. */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  const stored = readStored();
  if (!stored) return {};
  return {
    acquisitionSource: stored.acquisitionSource,
    acquisitionMedium: stored.acquisitionMedium,
    acquisitionCampaign: stored.acquisitionCampaign,
    acquisitionReferrer: stored.acquisitionReferrer,
  };
}
