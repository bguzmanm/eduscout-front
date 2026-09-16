const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Política de caché ISR para datos públicos: se revalidan cada hora y los
// resultados del scraping diario (06:00 America/Santiago) se propagan en ≤1h.
const PUBLIC_REVALIDATE = 3600;

interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Job {
  id: number;
  sourceId: number;
  externalId: string;
  title: string;
  company: string | null;
  department: string | null;
  location: string | null;
  region: string | null;
  jobType: string | null;
  description: string | null;
  requirements: string | null;
  salaryRange: string | null;
  publishedAt: string | null;
  deadline: string | null;
  applyUrl: string;
  isActive: boolean;
  scrapedAt: string;
  createdAt: string;
  sourceName: string;
  sourceSlug: string;
  sourceLogoUrl: string | null;
}

export interface Source {
  id: number;
  name: string;
  slug: string;
  baseUrl: string;
  scraperType: string;
  category: string;
  logoUrl: string | null;
  isActive: boolean;
  lastScraped: string | null;
  createdAt: string;
  jobCount: number;
}

export interface JobStats {
  bySource: { source: string; count: number }[];
  byRegion: { region: string; count: number }[];
  totalActive: number;
  activeSources: number;
}

async function unwrap<T>(res: Response): Promise<T> {
  const json = await res.json() as ApiResponse<T>;
  return json.data;
}

export async function getJobs(params: {
  page?: number;
  limit?: number;
  q?: string;
  source?: string;
  region?: string;
  jobType?: string;
  category?: string;
} = {}): Promise<PaginatedResponse<Job>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.q) searchParams.set('q', params.q);
  if (params.source) searchParams.set('source', params.source);
  if (params.region) searchParams.set('region', params.region);
  if (params.jobType) searchParams.set('jobType', params.jobType);
  if (params.category) searchParams.set('category', params.category);

  const res = await fetch(`${API_BASE}/api/jobs?${searchParams.toString()}`, {
    next: { revalidate: PUBLIC_REVALIDATE },
  });
  return unwrap<PaginatedResponse<Job>>(res);
}

export async function getJob(id: number): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    next: { revalidate: PUBLIC_REVALIDATE },
  });
  return unwrap<Job>(res);
}

export async function getSources(): Promise<Source[]> {
  const res = await fetch(`${API_BASE}/api/sources`, {
    next: { revalidate: PUBLIC_REVALIDATE },
  });
  return unwrap<Source[]>(res);
}

export async function getJobStats(): Promise<JobStats> {
  const res = await fetch(`${API_BASE}/api/jobs/stats`, {
    next: { revalidate: PUBLIC_REVALIDATE },
  });
  return unwrap<JobStats>(res);
}

export async function updateSource(
  id: number,
  data: { isActive: boolean },
  token: string,
): Promise<Source> {
  const res = await fetch(`/api/sources/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status} al actualizar la fuente`);
  return unwrap<Source>(res);
}

export interface ScrapingRunSource {
  slug: string;
  name: string;
  status: "ok" | "error";
  newCount: number;
  updatedCount: number;
  errorCount: number;
  errors: string[];
  durationMs: number;
}

export interface ScrapingRun {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  status: "running" | "completed" | "failed";
  totalNew: number;
  totalUpdated: number;
  totalErrors: number;
  durationMs: number | null;
  perSource: ScrapingRunSource[] | null;
  createdAt: string;
}

async function authedFetch<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return unwrap<T>(res);
}

export async function getScrapingReport(
  token: string,
): Promise<ScrapingRun | null> {
  return authedFetch<ScrapingRun | null>("/api/scraping/report", token);
}

export async function getScrapingReports(
  token: string,
  limit = 10,
): Promise<ScrapingRun[]> {
  return authedFetch<ScrapingRun[]>(
    `/api/scraping/reports?limit=${limit}`,
    token,
  );
}

export async function runScraping(
  token: string,
  source?: string,
): Promise<void> {
  const url = source
    ? `/api/scraping/run?source=${encodeURIComponent(source)}`
    : '/api/scraping/run';
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const json = (await res.json()) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      // sin cuerpo JSON
    }
    throw new Error(message);
  }
}

export interface AlertsDistribution {
  noAlerts: number;
  fewAlerts: number;
  manyAlerts: number;
}

export interface AdminCandidateStats {
  totalCandidates: number;
  candidatesWithCv: number;
  candidatesWithPhone: number;
  candidatesWithCvAndPhone: number;
  candidatesWithAlerts: number;
  totalAlerts: number;
  activeAlerts: number;
  inactiveAlerts: number;
  totalAlertMatches: number;
  avgAlertsPerCandidate: number;
  registeredLast7d: number;
  registeredLast30d: number;
  alertsDistribution: AlertsDistribution;
}

export async function getAdminCandidateStats(
  token: string,
): Promise<AdminCandidateStats> {
  return authedFetch<AdminCandidateStats>('/api/admin/stats/candidates', token);
}

export interface CandidateCv {
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  status: string;
  uploadedAt: string | null;
}

export interface CandidateProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  cv: CandidateCv;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateAuthResponse {
  token: string;
  candidate: CandidateProfile;
}

export interface AlertItem {
  id: number;
  candidateId: number;
  name: string;
  keywords: string[];
  regions: string[];
  jobTypes: string[];
  categories: string[];
  isActive: boolean;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlertMatch {
  id: number;
  alertId: number;
  job: Job;
  matchedAt: string;
}

export interface AlertCriteria {
  name?: string;
  keywords?: string[];
  regions?: string[];
  jobTypes?: string[];
  categories?: string[];
  isActive?: boolean;
}

const CANDIDATE_COOKIE = 'eduscout_candidate_session';

export function getCandidateToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CANDIDATE_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCandidateToken(token: string): void {
  const secure = location.protocol === 'https:' || location.hostname === 'localhost';
  document.cookie = `${CANDIDATE_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=604800; samesite=strict${secure ? '; Secure' : ''}`;
}

export function clearCandidateToken(): void {
  document.cookie = `${CANDIDATE_COOKIE}=; path=/; max-age=0; samesite=strict`;
}

async function candidateRequest<T>(
  url: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const json = (await res.json()) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      // no JSON body
    }
    throw new Error(message);
  }

  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

export function registerCandidate(
  data: { name: string; email: string; password: string },
): Promise<CandidateAuthResponse> {
  return candidateRequest<CandidateAuthResponse>('/api/candidates/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function loginCandidate(
  data: { email: string; password: string },
): Promise<CandidateAuthResponse> {
  return candidateRequest<CandidateAuthResponse>('/api/candidates/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function getCandidateMe(token: string): Promise<CandidateProfile> {
  return candidateRequest<CandidateProfile>('/api/candidates/me', {}, token);
}

export function updateCandidateMe(
  token: string,
  data: { name?: string; phone?: string },
): Promise<CandidateProfile> {
  return candidateRequest<CandidateProfile>('/api/candidates/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, token);
}

export async function uploadCandidateCv(
  token: string,
  file: File,
): Promise<CandidateProfile> {
  const form = new FormData();
  form.append('file', file);
  const res = await candidateRequest<{ profile?: CandidateProfile; message?: string }>(
    '/api/candidates/me/cv',
    { method: 'POST', body: form },
    token,
  );
  if (!res.profile) {
    throw new Error(res.message ?? 'No se pudo subir el CV');
  }
  return res.profile;
}

export async function downloadCandidateCv(token: string): Promise<Blob> {
  const res = await fetch('/api/candidates/me/cv', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const json = (await res.json()) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      // no JSON body
    }
    throw new Error(message);
  }
  return res.blob();
}

export function createAlert(
  token: string,
  data: AlertCriteria,
): Promise<AlertItem> {
  return candidateRequest<AlertItem>('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, token);
}

export function getAlerts(token: string): Promise<AlertItem[]> {
  return candidateRequest<AlertItem[]>('/api/alerts', {}, token);
}

export function updateAlert(
  token: string,
  id: number,
  data: AlertCriteria,
): Promise<AlertItem> {
  return candidateRequest<AlertItem>(`/api/alerts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, token);
}

export function deleteAlert(token: string, id: number): Promise<{ message: string }> {
  return candidateRequest<{ message: string }>(`/api/alerts/${id}`, {
    method: 'DELETE',
  }, token);
}

export function getAlertMatches(
  token: string,
  id: number,
): Promise<AlertMatch[]> {
  return candidateRequest<AlertMatch[]>(`/api/alerts/${id}/matches`, {}, token);
}
