'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCandidateToken, getSavedJobIds, saveJob, unsaveJob } from '@/lib/api';

interface SavedJobsContextValue {
  ready: boolean;
  isSaved: (jobId: number) => boolean;
  toggle: (jobId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);

export function SavedJobsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);
  const hydratedToken = useRef<string | null>(null);
  const requestId = useRef(0);

  const hydrate = useCallback(async () => {
    const current = ++requestId.current;
    const token = getCandidateToken();
    hydratedToken.current = token;
    if (!token) {
      setIds(new Set());
      setReady(true);
      return;
    }
    try {
      const jobIds = await getSavedJobIds(token);
      if (current === requestId.current) setIds(new Set(jobIds));
    } catch {
      if (current === requestId.current) setIds(new Set());
    } finally {
      if (current === requestId.current) setReady(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (!cancelled) await hydrate();
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    if (getCandidateToken() === hydratedToken.current) return;
    void hydrate();
  }, [pathname, ready, hydrate]);

  const isSaved = useCallback((jobId: number) => ids.has(jobId), [ids]);

  const refresh = useCallback(async () => {
    const token = getCandidateToken();
    if (!token) return;
    hydratedToken.current = token;
    try {
      const jobIds = await getSavedJobIds(token);
      setIds(new Set(jobIds));
    } catch {
      setIds(new Set());
    }
  }, []);

  const toggle = useCallback(
    async (jobId: number) => {
      const token = getCandidateToken();
      if (!token) {
        router.push('/perfil');
        return;
      }
      const wasSaved = ids.has(jobId);
      if (wasSaved) {
        setIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        try {
          await unsaveJob(token, jobId);
        } catch {
          setIds((prev) => new Set(prev).add(jobId));
        }
        return;
      }
      setIds((prev) => new Set(prev).add(jobId));
      try {
        await saveJob(token, jobId);
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      }
    },
    [ids, router],
  );

  const value = useMemo(
    () => ({ ready, isSaved, toggle, refresh }),
    [ready, isSaved, toggle, refresh],
  );

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs(): SavedJobsContextValue {
  const ctx = useContext(SavedJobsContext);
  if (!ctx) {
    throw new Error('useSavedJobs debe usarse dentro de SavedJobsProvider');
  }
  return ctx;
}
