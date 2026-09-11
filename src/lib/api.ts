const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

  const res = await fetch(`${API_BASE}/api/jobs?${searchParams.toString()}`);
  return unwrap<PaginatedResponse<Job>>(res);
}

export async function getJob(id: number): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`);
  return unwrap<Job>(res);
}

export async function getSources(): Promise<Source[]> {
  const res = await fetch(`${API_BASE}/api/sources`);
  return unwrap<Source[]>(res);
}

export async function getJobStats(): Promise<JobStats> {
  const res = await fetch(`${API_BASE}/api/jobs/stats`);
  return unwrap<JobStats>(res);
}
