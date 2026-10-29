'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

// Componente sin interfaz: registra el canal de llegada una vez por visita.
export default function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
