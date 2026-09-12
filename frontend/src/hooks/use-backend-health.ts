'use client';

import { useEffect, useState } from 'react';
import { fetchHealth } from '@/services/health.service';
import type { BackendStatus } from '@/types/health';

/** Checks the API health endpoint once on mount. */
export function useBackendHealth(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>('checking');

  useEffect(() => {
    const controller = new AbortController();

    fetchHealth(controller.signal)
      .then((health) =>
        setStatus(health.status === 'ok' ? 'online' : 'offline'),
      )
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus('offline');
        }
      });

    return () => controller.abort();
  }, []);

  return status;
}
